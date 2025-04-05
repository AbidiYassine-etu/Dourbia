import { ApiProperty } from '@nestjs/swagger';

export class GoogleUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  googleId: string;

  @ApiProperty()
  idToken: string;
}