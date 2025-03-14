import { IsOptional, MinLength, IsEmail, IsEnum } from 'class-validator';
import { USERROLES } from '../../utils/enum';

export class UpdateUserDto {
  @IsOptional()
  username?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  region?: string;

  @IsOptional()
  @IsEnum(USERROLES)
  role?: USERROLES;  
}
