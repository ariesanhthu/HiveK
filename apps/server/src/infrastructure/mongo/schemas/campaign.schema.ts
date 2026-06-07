import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { softDeletePlugin } from '../utils';

@Schema({ _id: false })
export class PlatformTargetItemModel {
  @Prop({ required: true })
  platformId: string;

  @Prop({ type: Number, required: false, min: 0 })
  minFollowers?: number;

  @Prop({ type: Number, required: false, min: 0 })
  maxFollowers?: number;

  @Prop({ type: String, required: false, maxlength: 500 })
  note?: string;

  @Prop({ type: MongooseSchema.Types.Map, of: MongooseSchema.Types.Mixed, required: false })
  others?: Record<string, any>;
}

@Schema({ _id: false })
export class RawContentItemModel {
  @Prop({ required: true })
  fileId: string;

  @Prop({ type: String, required: false, maxlength: 5000 })
  rawContent?: string;
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

  @Prop({ type: Number, required: true, min: 0 })
  budget: number;

  @Prop({ type: MongooseSchema.Types.Map, of: MongooseSchema.Types.Mixed, required: true })
  financial_target: Record<string, any>;

  @Prop({ type: String, required: true, trim: true, minlength: 1, maxlength: 2000 })
  description: string;

  @Prop({ type: [PlatformTargetItemModel], default: [] })
  platform_target: PlatformTargetItemModel[];

  @Prop({ type: String, required: true, enum: Object.values(ECampaignStatus), default: ECampaignStatus.DRAFT })
  status: ECampaignStatus;

  @Prop({ type: [String], default: [] })
  collaborator_ids: string[];

  @Prop({ type: [RawContentItemModel], default: [] })
  raw_contents: RawContentItemModel[];

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type CampaignDocument = HydratedDocument<CampaignModel>;
export const CampaignSchema = SchemaFactory.createForClass(CampaignModel);
CampaignSchema.plugin(softDeletePlugin);
