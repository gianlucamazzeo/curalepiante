import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty({ message: 'Il nome della categoria è obbligatorio' })
  nome: string;

  @IsString()
  @IsOptional()
  slug?: string; // Reso opzionale poiché verrà generato automaticamente se non fornito

  @IsString()
  @IsOptional()
  descrizione?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ordine?: number;

  @IsBoolean()
  @IsOptional()
  attiva?: boolean = true;
}
