import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email non valida' })
  @IsNotEmpty({ message: 'Email obbligatoria' })
  email: string;

  @IsString({ message: 'La password deve essere una stringa' })
  @IsNotEmpty({ message: 'Password obbligatoria' })
  @MinLength(6)
  password: string;
}
