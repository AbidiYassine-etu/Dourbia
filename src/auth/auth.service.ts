import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; 
import { SigninDto } from './dto/signin.dto';
import { EmailService } from 'src/email/email.service';
import { VerificationService } from 'src/verification/verification.service';
import { USERROLES } from 'src/utils/enum';
import { GoogleUserDto } from './dto/google-user.dto';

@Injectable()
export class AuthService {
  private pendingVerificationEmail: string | null = null;
  private pendingPasswordResetEmail: string | null = null;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService, 
    private emailService: EmailService,
    private verificationTokenService: VerificationService,
  ){}
//create user
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, country, region } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
        throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = this.userRepository.create({
        email,
        username,
        password: hashedPassword,
        avatar: '',
        country,
        region,
        phone: '',
    });

    return await this.userRepository.save(user);
}
//get all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }
//get user by id
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
//get user by email
  async findUserByEmail(email: string): Promise<User>  {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }


  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }


// update user
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }
//delete user
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
//register user
async signup(createUserDto: CreateUserDto): Promise<{ user: User; message: string }> {
  const { email, username, password, country, region } = createUserDto;

  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictException('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = this.userRepository.create({
    email,
    username,
    password: hashedPassword,
    avatar: '',
    country,
    region,
    phone: '', 
  });

  try {
    const savedUser = await this.userRepository.save(user);
    
    // Stocker l'email pour la vérification
    this.pendingVerificationEmail = email;
    
    // Envoi automatique d'OTP après la création du compte
    await this.generateEmailVerification(savedUser.id);
    
    return {
      user: savedUser,
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour le code de vérification.'
    };
  } catch (error) {
    if (error.code === '23505') {
      throw new ConflictException('Email already exists');
    }
    throw new InternalServerErrorException('Une erreur est survenue lors de la création du compte');
  }
}
  // user Connexion with JWT 
  async signin(signinDto: SigninDto): Promise<{ token: string; user: Partial<User> }> {
    const { email, password } = signinDto;
    
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
        throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.isBanned) {
        throw new UnauthorizedException('Votre compte a été suspendu. Veuillez contacter l\'administrateur.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedException('Identifiants invalides');
    }

    const token = this.jwtService.sign(
        {
            id: user.id, 
            email: user.email, 
            role: user.role,
        },
        { secret: process.env.JWT_SECRET, expiresIn: '24h' }
    );

    return { 
        token,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            country: user.country,
            region: user.region,
        }
    };
  }
  // Méthode pour obtenir le profil d'un utilisateur
  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }
// // code verification
// async generateEmailVerification(userId: number) {
//   console.log("Génération de l'OTP pour le userId:", userId);
  
//   const user = await this.userRepository.findOne({ where: { id: userId } });
//   if (!user) {
//     throw new NotFoundException('User not found');
//   }

//   if (user.emailVerifiedAt) {
//     throw new UnprocessableEntityException('Account already verified');
//   }
//   const otp = await this.verificationTokenService.generateOtp(user.id);
//   console.log('OTP généré :', otp);
  
//   try {
//     await this.emailService.sendEmail({
//       subject: 'Dourbia - Account Verification',
//       recipients: [{ address: user.email }],
//       html: `<p>Hi ${user.username},</p><p>Votre code de vérification est: <strong>${otp}</strong></p>`,
//     });
//   } catch (error) {
//     console.error("Erreur d'envoi d'email :", error);
//   }
// }
async generateEmailVerification(userId: number) {
  console.log("Génération de l'OTP pour le userId:", userId);
  
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
  }

  if (user.emailVerifiedAt) {
    throw new UnprocessableEntityException('Compte déjà vérifié');
  }

  const otp = await this.verificationTokenService.generateOtp(user.id);
  console.log('OTP généré :', otp);
  
  try {
    await this.emailService.sendEmail({
      subject: 'Dourbia - Vérification de compte',
      recipients: [{ address: user.email }],
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; background: white; padding: 20px; margin: auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2>Bienvenue sur Dourbia, ${user.username} !</h2>
            <p style="font-size: 16px; color: #555; text-align: center;">
              Merci de vous être inscrit. Veuillez utiliser le code ci-dessous pour vérifier votre adresse e-mail :
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #002863; background: #5ED8F2; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #777; text-align: center;">
              Ce code est valide pendant une durée limitée. Si vous n'avez pas demandé cet email, veuillez l'ignorer.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; text-align: center; color: #999;">
              © 2024 Dourbia. Tous droits réservés.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur d'envoi d'email :", error);
  }
}


async verifyEmailWithOtp(otp: string): Promise<boolean> {
  if (!this.pendingVerificationEmail) {
    throw new UnprocessableEntityException('Aucune vérification en attente');
  }

  const user = await this.findUserByEmail(this.pendingVerificationEmail);
  
  if (user.emailVerifiedAt) {
    throw new UnprocessableEntityException('Compte déjà vérifié');
  }

  const isValid = await this.verificationTokenService.validateOtp(user.id, otp);
  if (!isValid) {
    throw new UnprocessableEntityException('Code OTP invalide ou expiré');
  }

  user.emailVerifiedAt = new Date();
  await this.userRepository.save(user);
  
  // Réinitialiser l'email en attente
  this.pendingVerificationEmail = null;

  return true;
}

async toggleBan(id: number): Promise<User> {
  const user = await this.findOne(id);
  if (!user) {
    throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
  }
  user.isBanned = !user.isBanned;
  return await this.userRepository.save(user);
}

//méthode pour générer un code de réinitialisation de mot de passe
async generatePasswordResetOTP(email: string) {
  const user = await this.findUserByEmail(email);
  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé');
  }

  const otp = await this.verificationTokenService.generateOtp(user.id);
  
  try {
    await this.emailService.sendEmail({
      subject: 'Dourbia - Réinitialisation de mot de passe',
      recipients: [{ address: user.email }],
      html: `<p>Bonjour ${user.username},</p><p>Votre code de réinitialisation de mot de passe est: <strong>${otp}</strong></p>`,
    });
    
    // nouvelle variable
    this.pendingPasswordResetEmail = email;
    
    return { message: 'Code envoyé avec succès' };
  } catch (error) {
    throw new InternalServerErrorException("Erreur lors de l'envoi de l'email");
  }
}

// méthode pour vérifier le code de réinitialisation
async verifyPasswordResetOTP(otp: string): Promise<boolean> {
  if (!this.pendingPasswordResetEmail) {
    throw new UnprocessableEntityException('Aucune réinitialisation en attente');
  }

  const user = await this.findUserByEmail(this.pendingPasswordResetEmail);
  const isValid = await this.verificationTokenService.validateOtp(user.id, otp);
  
  if (!isValid) {
    throw new UnprocessableEntityException('Code OTP invalide ou expiré');
  }

  return true;
}

//méthode pour réinitialiser le mot de passe
async resetPassword(newPassword: string): Promise<boolean> {
  if (!this.pendingPasswordResetEmail) {
    throw new UnprocessableEntityException('Aucune réinitialisation en attente');
  }

  try {
    const user = await this.findUserByEmail(this.pendingPasswordResetEmail);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    await this.userRepository.save(user);

    this.pendingPasswordResetEmail = null;

    return true;
  } catch (error) {
    throw new InternalServerErrorException('Erreur lors de la réinitialisation du mot de passe');
  }
}




}
