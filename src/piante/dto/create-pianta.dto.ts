import { IsString, IsArray, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PiantaImmagineDto {
  @IsString()
  license: number;

  @IsString()
  license_name: string;

  @IsString()
  license_url: string;

  @IsString()
  original_url: string;

  @IsString()
  regular_url: string;

  @IsString()
  medium_url: string;

  @IsString()
  small_url: string;

  @IsString()
  thumbnail: string;
}

export class CreatePiantaDto {
  @IsString()
  common_name: string;

  @IsArray()
  @IsString({ each: true })
  scientific_name: string[];

  @IsArray()
  @IsString({ each: true })
  other_name: string[] = [];

  @IsString()
  cycle: string;

  @IsString()
  watering: string;

  @IsArray()
  @IsString({ each: true })
  sunlight: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PiantaImmagineDto)
  default_image?: PiantaImmagineDto | null;

  @IsOptional()
  @IsBoolean()
  indoor?: boolean;

  @IsOptional()
  @IsBoolean()
  flowers?: boolean;

  @IsOptional()
  @IsBoolean()
  fruits?: boolean;

  @IsOptional()
  @IsBoolean()
  cuisine?: boolean;

  @IsOptional()
  @IsBoolean()
  medicinal?: boolean;

  @IsOptional()
  @IsBoolean()
  poisonous_to_pets?: boolean;

  @IsOptional()
  @IsBoolean()
  edible?: boolean;

  @IsOptional()
  @IsString()
  pruning_count?: string;
}