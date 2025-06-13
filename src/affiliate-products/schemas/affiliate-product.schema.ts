import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AffiliateProductDocument = AffiliateProduct & Document;

@Schema({ timestamps: true })
export class AffiliateProduct {
  @Prop({ type: Types.ObjectId, ref: 'Plant', required: true })
  plant_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  plant_common_name: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  product_name: string;

  @Prop({ 
    required: true,
    enum: ['plant', 'seed', 'tool', 'fertilizer', 'pot', 'soil', 'other']
  })
  product_type: string;

  @Prop({ 
    required: true,
    enum: ['amazon', 'ebay', 'garden_center', 'custom']
  })
  affiliate_network: string;

  @Prop({ 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be valid'
    }
  })
  affiliate_url: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ maxlength: 1000 })
  product_description?: string;

  @Prop({ trim: true })
  brand?: string;

  @Prop()
  affiliate_id?: string;

  @Prop({
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be valid'
    }
  })
  original_url?: string;

  @Prop({
    type: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'GBP'] },
      last_updated: Date
    }
  })
  price?: {
    amount: number;
    currency: string;
    last_updated: Date;
  };

  @Prop({ min: 0 })
  original_price?: number;

  @Prop({ min: 0, max: 100 })
  discount_percentage?: number;

  @Prop([{
    url: { type: String, required: true },
    alt_text: String,
    is_primary: { type: Boolean, default: false }
  }])
  images?: Array<{
    url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;

  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop({ min: 0 })
  review_count?: number;

  @Prop({ enum: ['in_stock', 'out_of_stock', 'limited'] })
  availability?: string;

  @Prop()
  shipping_info?: string;

  @Prop({ default: 0 })
  priority: number;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: 0 })
  conversions: number;

  @Prop({ default: 0 })
  revenue: number;

  @Prop()
  last_click?: Date;

  @Prop([String])
  seo_keywords?: string[];

  @Prop({ maxlength: 500 })
  promotional_text?: string;

  @Prop({ default: 'Acquista ora', maxlength: 50 })
  call_to_action: string;

  @Prop()
  expires_at?: Date;
}

export const AffiliateProductSchema = SchemaFactory.createForClass(AffiliateProduct);

AffiliateProductSchema.index({ plant_id: 1, is_active: 1 });
AffiliateProductSchema.index({ affiliate_network: 1 });
AffiliateProductSchema.index({ priority: -1, featured: -1 });