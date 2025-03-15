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

@Injectable()
export class AuthService {
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
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
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
async signup(createUserDto: CreateUserDto): Promise<User> {
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
    await this.userRepository.save(user);
    
 //envoi automatique d'OTP après la création du compte
    await this.generateEmailVerification(user.id);
    
    return user;
  } catch (error) {
    if (error.code === '23505') {
      throw new ConflictException('Email already exists');
    }
    throw new InternalServerErrorException();
  }
}
  // user Connexion with JWT 
  async signin(signinDto: SigninDto): Promise<{ token: string; user: Partial<User> }> {
    const { email, password } = signinDto;
    
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
    }
    // Vérification du secret JWT
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    // Génération du token JWT
    const token = this.jwtService.sign(
        {
            id: user.id, 
            email: user.email, 
            role: user.role,
        },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' }
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
// code verification
async generateEmailVerification(userId: number) {
  console.log(' Génération de l’OTP pour le userId:', userId);
  
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.emailVerifiedAt) {
    throw new UnprocessableEntityException('Account already verified');
  }
  const otp = await this.verificationTokenService.generateOtp(user.id);
  console.log('OTP généré :', otp);
  
  try {
    await this.emailService.sendEmail({
      subject: 'Dourbia - Account Verification',
      recipients: [{ address: user.email }],
      html: `<p>Hi ${user.username},</p><p>Votre code de vérification est: <strong>${otp}</strong></p>`,
    });
  } catch (error) {
    console.error(' Erreur d’envoi d’email :', error);
  }
}
//email verification
  async verifyEmail(userId: number, token: string) {
    const invalidMessage = 'Invalid or expired OTP';

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const isValid = await this.verificationTokenService.validateOtp(
      user.id,
      token,
    );

    if (!isValid) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    user.emailVerifiedAt = new Date();

    await this.userRepository.save(user);

    return true;
  }

}
