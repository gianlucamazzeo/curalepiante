import { IsString, IsArray, IsOptional, IsBoolean, IsObject, ValidateNested, IsNumber } from 'class-validator';
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

class PiantaDimensionsDto {
  @IsOptional()
  @IsNumber()
  min_height?: number;

  @IsOptional()
  @IsNumber()
  max_height?: number;

  @IsOptional()
  @IsString()
  height_unit?: string;

  @IsOptional()
  @IsNumber()
  min_width?: number;

  @IsOptional()
  @IsNumber()
  max_width?: number;

  @IsOptional()
  @IsString()
  width_unit?: string;
}

class PiantaHardinessDto {
  @IsOptional()
  @IsString()
  min?: string;

  @IsOptional()
  @IsString()
  max?: string;
}

class PiantaAnatomyDto {
  @IsOptional()
  @IsString()
  part?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  color?: string[];
}

class PiantaWateringTemperatureDto {
  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;
}

class PiantaWateringPhLevelDto {
  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;
}

class PiantaSunlightDurationDto {
  @IsOptional()
  @IsString()
  min?: string;

  @IsOptional()
  @IsString()
  max?: string;

  @IsOptional()
  @IsString()
  unit?: string;
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

  @IsOptional()
  @IsString()
  family?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  origin?: string[];

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PiantaDimensionsDto)
  dimensions?: PiantaDimensionsDto;

  @IsOptional()
  @IsString()
  care_level?: string;

  @IsOptional()
  @IsString()
  growth_rate?: string;

  @IsOptional()
  @IsString()
  maintenance?: string;

  @IsOptional()
  @IsBoolean()
  drought_tolerant?: boolean;

  @IsOptional()
  @IsBoolean()
  salt_tolerant?: boolean;

  @IsOptional()
  @IsBoolean()
  tropical?: boolean;

  @IsOptional()
  @IsBoolean()
  rare?: boolean;

  @IsOptional()
  @IsBoolean()
  invasive?: boolean;

  @IsOptional()
  @IsBoolean()
  thorny?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PiantaHardinessDto)
  hardiness?: PiantaHardinessDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pruning_month?: string[];

  @IsOptional()
  @IsString()
  flowering_season?: string;

  @IsOptional()
  @IsString()
  fruiting_season?: string;

  @IsOptional()
  @IsString()
  harvest_season?: string;

  @IsOptional()
  @IsString()
  harvest_method?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attracts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propagation?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PiantaAnatomyDto)
  plant_anatomy?: PiantaAnatomyDto[];

  @IsOptional()
  @IsBoolean()
  poisonous_to_humans?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  xWateringQuality?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  xWateringAvgVolumeRequirement?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  xWateringDepthRequirement?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PiantaWateringTemperatureDto)
  xWateringBasedTemperature?: PiantaWateringTemperatureDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PiantaWateringPhLevelDto)
  xWateringPhLevel?: PiantaWateringPhLevelDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PiantaSunlightDurationDto)
  xSunlightDuration?: PiantaSunlightDurationDto;
}