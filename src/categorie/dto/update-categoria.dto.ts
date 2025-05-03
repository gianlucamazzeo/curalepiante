import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  slug?: string; // Manteniamo slug come opzionale anche nell'update

  @IsString()
  @IsOptional()
  descrizione?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ordine?: number;

  @IsOptional()
  attiva?: boolean;
}
