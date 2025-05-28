import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class PiantaImmagine {
  @Prop({ required: true })
  license: number;

  @Prop({ required: true })
  license_name: string;

  @Prop({ required: true })
  license_url: string;

  @Prop({ required: true })
  original_url: string;

  @Prop({ required: true })
  regular_url: string;

  @Prop({ required: true })
  medium_url: string;

  @Prop({ required: true })
  small_url: string;

  @Prop({ required: true })
  thumbnail: string;
}

const PiantaImmagineSchema = SchemaFactory.createForClass(PiantaImmagine);

@Schema({ timestamps: true })
export class Pianta extends Document {
  @Prop({ required: true, unique: true })
  declare id: number;

  @Prop({ required: true })
  common_name: string;

  @Prop({ type: [String], required: true })
  scientific_name: string[];

  @Prop({ type: [String], default: [] })
  other_name: string[];

  @Prop({ required: true })
  cycle: string;

  @Prop({ required: true })
  watering: string;

  @Prop({ type: [String], required: true })
  sunlight: string[];

  @Prop({ type: PiantaImmagineSchema, default: null })
  default_image: PiantaImmagine | null;

  @Prop({ default: false })
  indoor?: boolean;

  @Prop({ default: false })
  flowers?: boolean;

  @Prop({ default: false })
  fruits?: boolean;

  @Prop({ default: false })
  cuisine?: boolean;

  @Prop({ default: false })
  medicinal?: boolean;

  @Prop({ default: false })
  poisonous_to_pets?: boolean;

  @Prop({ default: false })
  edible?: boolean;

  @Prop()
  pruning_count?: string;
}

export const PiantaSchema = SchemaFactory.createForClass(Pianta);
export type PiantaDocument = Pianta & Document;