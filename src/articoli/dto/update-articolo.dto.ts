import { PartialType, OmitType } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArticoloDto } from './create-articolo.dto';

// Classe per aggiornamento link prodotto
class UpdateLinkProdottoDto {
  @IsString()
  url: string;

  @IsString()
  descrizione: string;

  @IsBoolean()
  affiliatoAmazon: boolean;
}

// Classe per aggiornamento immagine
class UpdateImmagineDto {
  @IsString()
  url: string;

  @IsString()
  altText: string;

  @IsBoolean()
  @IsOptional()
  principale: boolean;
}

// DTO per aggiornamento articolo che estende parzialmente CreateArticoloDto
export class UpdateArticoloDto extends PartialType(
  OmitType(CreateArticoloDto, ['slug'] as const),
) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArticoloDto)
  @IsOptional()
  linkProdotti?: UpdateLinkProdottoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateImmagineDto)
  @IsOptional()
  immagini?: UpdateImmagineDto[];

  @IsBoolean()
  @IsOptional()
  pubblicato?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  inEvidenza?: boolean;
}
