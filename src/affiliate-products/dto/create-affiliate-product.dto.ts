import { IsString, IsNotEmpty, IsEnum, IsUrl, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class PriceDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(['EUR', 'USD', 'GBP'])
  currency?: string = 'EUR';

  @IsOptional()
  last_updated?: Date;
}

class ImageDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  alt_text?: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean = false;
}

export class CreateAffiliateProductDto {
  @IsNotEmpty()
  @IsString()
  plant_id: string;

  @IsNotEmpty()
  @IsString()
  plant_common_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  product_name: string;

  @IsEnum(['plant', 'seed', 'tool', 'fertilizer', 'pot', 'soil', 'other'])
  product_type: string;

  @IsEnum(['amazon', 'ebay', 'garden_center', 'custom'])
  affiliate_network: string;

  @IsUrl()
  affiliate_url: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  product_description?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  affiliate_id?: string;

  @IsOptional()
  @IsUrl()
  original_url?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceDto)
  price?: PriceDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  original_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  review_count?: number;

  @IsOptional()
  @IsEnum(['in_stock', 'out_of_stock', 'limited'])
  availability?: string;

  @IsOptional()
  @IsString()
  shipping_info?: string;

  @IsOptional()
  @IsNumber()
  priority?: number = 0;

  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seo_keywords?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  promotional_text?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  call_to_action?: string = 'Acquista ora';

  @IsOptional()
  expires_at?: Date;
}