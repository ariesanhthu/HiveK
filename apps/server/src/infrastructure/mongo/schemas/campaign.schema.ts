import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class CampaignInfoModel {
  @Prop({ type: MongooseSchema.Types.String, required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: ['promotion', 'launch', 'seasonal'] })
  type: 'promotion' | 'launch' | 'seasonal';

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  start_date: Date;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  end_date: Date;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  objective: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  description: string;
}

@Schema({ _id: false })
export class AudienceModel {
  @Prop({ type: MongooseSchema.Types.String, required: true })
  age_range: string;

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  interests: string[];
}

@Schema({ _id: false })
export class TargetingModel {
  @Prop({ type: AudienceModel, required: true })
  audience: AudienceModel;

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  locations: string[];
}

@Schema({ _id: false })
export class ProductModel {
  @Prop({ type: MongooseSchema.Types.String, required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  category: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  brand: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  description: string;

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  features: string[];

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  keywords: string[];

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: ['low', 'mid', 'high'] })
  price_segment: 'low' | 'mid' | 'high';
}

@Schema({ _id: false })
export class MarketingModel {
  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  angle: string[];

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  content_style: string[];

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  tone: string[];

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  key_messages: string[];
}

@Schema({ _id: false })
export class PricingModel {
  @Prop({ type: MongooseSchema.Types.Number, required: true })
  original_price: number;

  @Prop({ type: MongooseSchema.Types.Number, required: true })
  sale_price: number;

  @Prop({ type: MongooseSchema.Types.String, required: true, default: 'VND' })
  currency: string;
}

@Schema({ _id: false })
export class PromotionModel {
  @Prop({ type: MongooseSchema.Types.String, required: true, enum: ['discount', 'bundle', 'cashback'] })
  type: 'discount' | 'bundle' | 'cashback';

  @Prop({ type: MongooseSchema.Types.Number, required: true })
  value: number;

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: ['percent', 'amount'] })
  unit: 'percent' | 'amount';
}

@Schema({ _id: false })
export class ChannelModel {
  @Prop({ type: MongooseSchema.Types.String, required: true, enum: ['ecommerce', 'retail', 'social'] })
  type: 'ecommerce' | 'retail' | 'social';

  @Prop({ type: MongooseSchema.Types.String, required: true })
  platform: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
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
  @Prop({ type: MongooseSchema.Types.String, required: true })
  file_id: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  raw_text: string;

  @Prop({ type: MongooseSchema.Types.String, default: '' })
  inference: string;
}

@Schema({
  collection: 'campaigns',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CampaignModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel' })
  owner_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'EnterpriseModel' })
  enterprise_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: CampaignInfoModel, required: true })
  campaign: CampaignInfoModel;

  @Prop({ type: TargetingModel, required: true })
  targeting: TargetingModel;

  @Prop({ type: [CampaignItemModel], default: [] })
  campaign_items: CampaignItemModel[];

  @Prop({ type: [RawItemModel], default: [] })
  raw: RawItemModel[];

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type CampaignDocument = HydratedDocument<CampaignModel>;
export const CampaignSchema = SchemaFactory.createForClass(CampaignModel);
