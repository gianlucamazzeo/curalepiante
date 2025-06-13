import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AffiliateProductsService } from './affiliate-products.service';
import { AffiliateProductsController } from './affiliate-products.controller';
import { AffiliateProduct, AffiliateProductSchema } from './schemas/affiliate-product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AffiliateProduct.name, schema: AffiliateProductSchema },
    ]),
  ],
  controllers: [AffiliateProductsController],
  providers: [AffiliateProductsService],
  exports: [AffiliateProductsService],
})
export class AffiliateProductsModule {}