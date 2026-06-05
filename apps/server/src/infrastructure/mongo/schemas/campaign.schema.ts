import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

@Schema({ _id: false })
export class PlatformTargetItemModel {
  @Prop({ type: MongooseSchema.Types.String, required: true })
  platformId: string;

  @Prop({ type: MongooseSchema.Types.Number, required: false })
  minFollowers?: number;

  @Prop({ type: MongooseSchema.Types.Number, required: false })
  maxFollowers?: number;

  @Prop({ type: MongooseSchema.Types.String, required: false })
  note?: string;

  @Prop({ type: MongooseSchema.Types.Map, of: MongooseSchema.Types.Mixed, required: false })
  others?: Record<string, any>;
}

@Schema({ _id: false })
export class RawContentItemModel {
  @Prop({ type: MongooseSchema.Types.String, required: true })
  fileId: string;

  @Prop({ type: MongooseSchema.Types.String, required: false })
  rawContent?: string;
}

@Schema({
  collection: 'campaigns',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CampaignModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel' })
  owner_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'EnterpriseModel', default: null })
  enterprise_id: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.Number, required: true })
  budget: number;

  @Prop({ type: MongooseSchema.Types.Map, of: MongooseSchema.Types.Mixed, required: true })
  financial_target: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  description: string;

  @Prop({ type: [PlatformTargetItemModel], default: [] })
  platform_target: PlatformTargetItemModel[];

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: Object.values(ECampaignStatus), default: ECampaignStatus.DRAFT })
  status: ECampaignStatus;

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  collaborator_ids: string[];

  @Prop({ type: [RawContentItemModel], default: [] })
  raw_contents: RawContentItemModel[];

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type CampaignDocument = HydratedDocument<CampaignModel>;
export const CampaignSchema = SchemaFactory.createForClass(CampaignModel);
