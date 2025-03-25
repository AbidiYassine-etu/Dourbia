import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordFinalDto {
  @IsString()
  @MinLength(6)
  @ApiProperty()
  newPassword: string;
} 