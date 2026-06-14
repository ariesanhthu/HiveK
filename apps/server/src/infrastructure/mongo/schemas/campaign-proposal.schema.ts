import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { EProposalStatus, EMediaSlideType, EProductPlatform } from '@/core/enums';
import { softDeletePlugin } from '../utils';

@Schema({ _id: false })
export class MediaSlideSubModel {
  @Prop({ required: true, type: String, enum: Object.values(EMediaSlideType) })
  type: EMediaSlideType;

  @Prop({ required: true })
  file_id: string;

  @Prop({ required: true, type: Number, min: 0 })
  display_order: number;
}
export const MediaSlideSubSchema = SchemaFactory.createForClass(MediaSlideSubModel);

@Schema({ _id: false })
export class ProductItemSubModel {
  @Prop({ required: true })
  product_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  image_id: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String, default: {} })
  affiliate_urls: Record<string, string>;
}
export const ProductItemSubSchema = SchemaFactory.createForClass(ProductItemSubModel);

@Schema({ _id: false })
export class VoucherItemSubModel {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, type: String, enum: Object.values(EProductPlatform) })
  platform: EProductPlatform;

  @Prop({ required: true })
  discount_value: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date })
  expiration_date: Date;
}
export const VoucherItemSubSchema = SchemaFactory.createForClass(VoucherItemSubModel);

@Schema({
  collection: 'campaign_proposals',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CampaignProposalModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'CampaignModel' })
  campaign_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  description: string;

  @Prop({ type: [MediaSlideSubSchema], default: [] })
  media_slides: MediaSlideSubModel[];

  @Prop({ type: [ProductItemSubSchema], default: [] })
  products: ProductItemSubModel[];

  @Prop({ type: [VoucherItemSubSchema], default: [] })
  vouchers: VoucherItemSubModel[];

  @Prop({ required: true, type: String, enum: Object.values(EProposalStatus), default: EProposalStatus.ACTIVE })
  status: EProposalStatus;

  @Prop({ type: MongooseSchema.Types.Map, of: Number, default: { totalViews: 0, totalClicks: 0 } })
  metrics: Record<string, number>;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type CampaignProposalDocument = HydratedDocument<CampaignProposalModel>;
export const CampaignProposalSchema = SchemaFactory.createForClass(CampaignProposalModel);
CampaignProposalSchema.plugin(softDeletePlugin);
