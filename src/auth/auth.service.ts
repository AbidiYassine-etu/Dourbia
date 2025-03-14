import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; 
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService, 
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

}
