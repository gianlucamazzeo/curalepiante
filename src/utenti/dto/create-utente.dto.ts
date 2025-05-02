import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUtenteDto {
  @IsEmail({}, { message: 'Email non valida' })
  @IsNotEmpty({ message: 'Email obbligatoria' })
  email: string;

  @IsString({ message: 'La password deve essere una stringa' })
  @IsNotEmpty({ message: 'Password obbligatoria' })
  @MinLength(8, { message: 'La password deve essere di almeno 8 caratteri' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero o un carattere speciale',
  })
  password: string;

  @IsString({ message: 'Il nome deve essere una stringa' })
  @IsNotEmpty({ message: 'Nome obbligatorio' })
  nome: string;

  @IsString({ message: 'Il cognome deve essere una stringa' })
  @IsNotEmpty({ message: 'Cognome obbligatorio' })
  cognome: string;

  @IsEnum(['ADMIN', 'UTENTE_STANDARD'], { message: 'Ruolo non valido' })
  @IsOptional()
  ruolo?: string;

  @IsOptional()
  attivo?: boolean;
}
