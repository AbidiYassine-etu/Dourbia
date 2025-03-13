import { IsEmail, IsNotEmpty, MinLength } from "@nestjs/class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    country: string;

    @IsNotEmpty()
    region: string;
}
