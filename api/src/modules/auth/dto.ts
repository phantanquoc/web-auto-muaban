import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
export class RegisterDto { @IsEmail() email!: string; @IsString() @MinLength(6) password!: string; }
export class LoginDto { @IsEmail() email!: string; @IsString() @IsNotEmpty() password!: string; }
export class VerifyLinkDto { @IsString() @IsNotEmpty() characterName!: string; @IsString() @IsNotEmpty() code!: string; }
