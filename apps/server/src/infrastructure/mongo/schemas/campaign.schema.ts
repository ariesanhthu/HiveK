import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class CampaignInfoModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['promotion', 'launch', 'seasonal'] })
  type: 'promotion' | 'launch' | 'seasonal';

  @Prop({ required: true, type: Date })
  start_date: Date;

  @Prop({ required: true, type: Date })
  end_date: Date;

  @Prop({ required: true })
  objective: string;

  @Prop({ required: true })
  description: string;
}

@Schema({ _id: false })
export class AudienceModel {
  @Prop({ required: true })
  age_range: string;

  @Prop({ type: [String], default: [] })
  interests: string[];
}

@Schema({ _id: false })
export class TargetingModel {
  @Prop({ type: AudienceModel, required: true })
  audience: AudienceModel;

  @Prop({ type: [String], default: [] })
  locations: string[];
}

@Schema({ _id: false })
export class ProductModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ required: true, enum: ['low', 'mid', 'high'] })
  price_segment: 'low' | 'mid' | 'high';
}

@Schema({ _id: false })
export class MarketingModel {
  @Prop({ type: [String], default: [] })
  angle: string[];

  @Prop({ type: [String], default: [] })
  content_style: string[];

  @Prop({ type: [String], default: [] })
  tone: string[];

  @Prop({ type: [String], default: [] })
  key_messages: string[];
}

@Schema({ _id: false })
export class PricingModel {
  @Prop({ required: true })
  original_price: number;

  @Prop({ required: true })
  sale_price: number;

  @Prop({ required: true, default: 'VND' })
  currency: string;
}

@Schema({ _id: false })
export class PromotionModel {
  @Prop({ required: true, enum: ['discount', 'bundle', 'cashback'] })
  type: 'discount' | 'bundle' | 'cashback';

  @Prop({ required: true })
  value: number;

  @Prop({ required: true, enum: ['percent', 'amount'] })
  unit: 'percent' | 'amount';
}

@Schema({ _id: false })
export class ChannelModel {
  @Prop({ required: true, enum: ['ecommerce', 'retail', 'social'] })
  type: 'ecommerce' | 'retail' | 'social';

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  url: string;
}

@Schema({ _id: false })
export class CampaignItemModel {
  @Prop({ type: ProductModel, required: true })
  product: ProductModel;

  @Prop({ type: MarketingModel, required: true })
  marketing: MarketingModel;

  @Prop({ type: PricingModel, required: true })
  pricing: PricingModel;

  @Prop({ type: PromotionModel, required: true })
  promotion: PromotionModel;

  @Prop({ type: [ChannelModel], default: [] })
  channels: ChannelModel[];
}

@Schema({ _id: false })
export class RawItemModel {
  @Prop({ required: true })
  file_id: string;

  @Prop({ required: true })
  raw_text: string;

  @Prop({ default: '' })
  inference: string;
}

@Schema({
  collection: 'campaigns',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CampaignModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  owner_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  enterprise_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: CampaignInfoModel, required: true })
  campaign: CampaignInfoModel;

  @Prop({ type: TargetingModel, required: true })
  targeting: TargetingModel;

  @Prop({ type: [CampaignItemModel], default: [] })
  campaign_items: CampaignItemModel[];

  @Prop({ type: [RawItemModel], default: [] })
  raw: RawItemModel[];

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;
}

export type CampaignDocument = HydratedDocument<CampaignModel>;
export const CampaignSchema = SchemaFactory.createForClass(CampaignModel);
