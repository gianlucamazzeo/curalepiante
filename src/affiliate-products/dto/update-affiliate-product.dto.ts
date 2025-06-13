import { PartialType } from '@nestjs/mapped-types';
import { CreateAffiliateProductDto } from './create-affiliate-product.dto';

export class UpdateAffiliateProductDto extends PartialType(CreateAffiliateProductDto) {}