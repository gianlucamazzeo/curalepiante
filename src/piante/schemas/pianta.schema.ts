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

@Schema({ _id: false })
export class PiantaDimensions {
  @Prop()
  min_height?: number;

  @Prop()
  max_height?: number;

  @Prop()
  height_unit?: string;

  @Prop()
  min_width?: number;

  @Prop()
  max_width?: number;

  @Prop()
  width_unit?: string;
}

@Schema({ _id: false })
export class PiantaHardiness {
  @Prop()
  min?: string;

  @Prop()
  max?: string;
}

@Schema({ _id: false })
export class PiantaAnatomy {
  @Prop()
  part?: string;

  @Prop({ type: [String] })
  color?: string[];
}

@Schema({ _id: false })
export class PiantaWateringTemperature {
  @Prop()
  unit?: string;

  @Prop()
  min?: number;

  @Prop()
  max?: number;
}

@Schema({ _id: false })
export class PiantaWateringPhLevel {
  @Prop()
  min?: number;

  @Prop()
  max?: number;
}

@Schema({ _id: false })
export class PiantaSunlightDuration {
  @Prop()
  min?: string;

  @Prop()
  max?: string;

  @Prop()
  unit?: string;
}

const PiantaImmagineSchema = SchemaFactory.createForClass(PiantaImmagine);
const PiantaDimensionsSchema = SchemaFactory.createForClass(PiantaDimensions);
const PiantaHardinessSchema = SchemaFactory.createForClass(PiantaHardiness);
const PiantaAnatomySchema = SchemaFactory.createForClass(PiantaAnatomy);
const PiantaWateringTemperatureSchema = SchemaFactory.createForClass(
  PiantaWateringTemperature,
);
const PiantaWateringPhLevelSchema = SchemaFactory.createForClass(PiantaWateringPhLevel);
const PiantaSunlightDurationSchema = SchemaFactory.createForClass(PiantaSunlightDuration);

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

  @Prop()
  family?: string;

  @Prop({ type: [String] })
  origin?: string[];

  @Prop()
  type?: string;

  @Prop({ type: PiantaDimensionsSchema })
  dimensions?: PiantaDimensions;

  @Prop()
  care_level?: string;

  @Prop()
  growth_rate?: string;

  @Prop()
  maintenance?: string;

  @Prop({ default: false })
  drought_tolerant?: boolean;

  @Prop({ default: false })
  salt_tolerant?: boolean;

  @Prop({ default: false })
  tropical?: boolean;

  @Prop({ default: false })
  rare?: boolean;

  @Prop({ default: false })
  invasive?: boolean;

  @Prop({ default: false })
  thorny?: boolean;

  @Prop({ type: PiantaHardinessSchema })
  hardiness?: PiantaHardiness;

  @Prop({ type: [String] })
  pruning_month?: string[];

  @Prop()
  flowering_season?: string;

  @Prop()
  fruiting_season?: string;

  @Prop()
  harvest_season?: string;

  @Prop()
  harvest_method?: string;

  @Prop({ type: [String] })
  attracts?: string[];

  @Prop({ type: [String] })
  propagation?: string[];

  @Prop({ type: [PiantaAnatomySchema] })
  plant_anatomy?: PiantaAnatomy[];

  @Prop({ default: false })
  poisonous_to_humans?: boolean;

  @Prop()
  description?: string;

  @Prop({ type: [String] })
  xWateringQuality?: string[];

  @Prop({ type: [String] })
  xWateringAvgVolumeRequirement?: string[];

  @Prop({ type: [String] })
  xWateringDepthRequirement?: string[];

  @Prop({ type: PiantaWateringTemperatureSchema })
  xWateringBasedTemperature?: PiantaWateringTemperature;

  @Prop({ type: PiantaWateringPhLevelSchema })
  xWateringPhLevel?: PiantaWateringPhLevel;

  @Prop({ type: PiantaSunlightDurationSchema })
  xSunlightDuration?: PiantaSunlightDuration;
}

export const PiantaSchema = SchemaFactory.createForClass(Pianta);
export type PiantaDocument = Pianta & Document;