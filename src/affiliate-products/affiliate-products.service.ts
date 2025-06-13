import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AffiliateProduct, AffiliateProductDocument } from './schemas/affiliate-product.schema';
import { CreateAffiliateProductDto, UpdateAffiliateProductDto } from './dto';

@Injectable()
export class AffiliateProductsService {
  constructor(
    @InjectModel(AffiliateProduct.name)
    private affiliateProductModel: Model<AffiliateProductDocument>,
  ) {}

  async create(createAffiliateProductDto: CreateAffiliateProductDto): Promise<AffiliateProduct> {
    const createdProduct = new this.affiliateProductModel({
      ...createAffiliateProductDto,
      plant_id: new Types.ObjectId(createAffiliateProductDto.plant_id),
    });
    return createdProduct.save();
  }

  async findAll(): Promise<AffiliateProduct[]> {
    return this.affiliateProductModel.find({ is_active: true }).exec();
  }

  async findByPlantId(plantId: string): Promise<AffiliateProduct[]> {
    return this.affiliateProductModel
      .find({ 
        plant_id: new Types.ObjectId(plantId), 
        is_active: true 
      })
      .sort({ priority: -1, featured: -1 })
      .exec();
  }

  async findOne(id: string): Promise<AffiliateProduct> {
    const product = await this.affiliateProductModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Affiliate product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateAffiliateProductDto: UpdateAffiliateProductDto): Promise<AffiliateProduct> {
    const updateData = { ...updateAffiliateProductDto };
    if (updateData.plant_id) {
      updateData.plant_id = new Types.ObjectId(updateData.plant_id) as any;
    }

    const updatedProduct = await this.affiliateProductModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedProduct) {
      throw new NotFoundException(`Affiliate product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.affiliateProductModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Affiliate product with ID ${id} not found`);
    }
  }

  async incrementClicks(id: string): Promise<AffiliateProduct> {
    const updatedProduct = await this.affiliateProductModel
      .findByIdAndUpdate(
        id,
        { 
          $inc: { clicks: 1 },
          $set: { last_click: new Date() }
        },
        { new: true }
      )
      .exec();
    
    if (!updatedProduct) {
      throw new NotFoundException(`Affiliate product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async incrementConversions(id: string, revenue?: number): Promise<AffiliateProduct> {
    const updateData: any = { $inc: { conversions: 1 } };
    if (revenue) {
      updateData.$inc.revenue = revenue;
    }

    const updatedProduct = await this.affiliateProductModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedProduct) {
      throw new NotFoundException(`Affiliate product with ID ${id} not found`);
    }
    return updatedProduct;
  }
}