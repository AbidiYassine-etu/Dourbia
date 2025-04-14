import { IsEmail, IsNotEmpty, MinLength} from "class-validator";

export class CreateContactDto {
    
    @IsNotEmpty()
    nom: string;
     
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(8)
    phone: string;
    
    @IsNotEmpty()
    object: string;

    @IsNotEmpty()
    message: string;
}
