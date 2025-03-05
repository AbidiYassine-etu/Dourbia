import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async signup(createUserDto: CreateUserDto):Promise<User> {
    const{ email, username, password } = createUserDto

    const existingUser = await this.userRepository.findOne({where: {email} });
    if(existingUser){
      throw new ConflictException('Email already exists');

    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      avatar:'',
    });

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      if(error.code ==='23505'){
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }

}
