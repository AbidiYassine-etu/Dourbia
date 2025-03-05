import { IsString, IsNotEmpty } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
