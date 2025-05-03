import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
  IsBoolean,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Schema as MongooseSchema } from 'mongoose';

// Classi per i nested objects
class LinkProdottoDto {
  @IsString()
  url: string;

  @IsString()
  descrizione: string;

  @IsBoolean()
  affiliatoAmazon: boolean;
}

class ImmagineDto {
  @IsString()
  url: string;

  @IsString()
  altText: string;

  @IsBoolean()
  @IsOptional()
  principale: boolean;
}

export class CreateArticoloDto {
  @IsNotEmpty({ message: 'Il titolo è obbligatorio' })
  @IsString({ message: 'Il titolo deve essere una stringa' })
  titolo: string;

  @IsNotEmpty({ message: 'La descrizione è obbligatoria' })
  @IsString({ message: 'La descrizione deve essere una stringa' })
  descrizione: string;

  @IsOptional()
  @IsString({ message: 'Il contenuto deve essere una stringa' })
  contenuto?: string;

  @IsOptional()
  @IsString({ message: 'Lo slug deve essere una stringa' })
  slug?: string; // Aggiungi questo campo se vuoi ometterlo nell'UpdateDto

  @IsNotEmpty({ message: 'La categoria principale è obbligatoria' })
  @IsMongoId({
    message: 'La categoria principale deve essere un ID MongoDB valido',
  })
  categoriaPrincipale: MongooseSchema.Types.ObjectId;

  @IsOptional()
  @IsArray({ message: 'Le categorie secondarie devono essere un array' })
  @IsMongoId({
    each: true,
    message: 'Ogni categoria secondaria deve essere un ID MongoDB valido',
  })
  categorieSecondarie?: MongooseSchema.Types.ObjectId[];

  @IsOptional()
  @IsBoolean({ message: 'Il campo pubblicato deve essere un booleano' })
  pubblicato?: boolean;

  @IsOptional()
  @IsNumber({}, { message: "L'ordine deve essere un numero" })
  @Min(0, { message: "L'ordine deve essere maggiore o uguale a 0" })
  ordine?: number;

  @IsOptional()
  @IsString({ message: "L'immagine deve essere una stringa (URL o percorso)" })
  immagine?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkProdottoDto)
  linkProdotti?: LinkProdottoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImmagineDto)
  immagini?: ImmagineDto[];

  @IsOptional()
  @IsArray({ message: 'I tag devono essere un array' })
  @IsString({ each: true, message: 'Ogni tag deve essere una stringa' })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  inEvidenza?: boolean;
}
