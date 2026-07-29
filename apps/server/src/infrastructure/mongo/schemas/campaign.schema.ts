import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import {
  EParticipantStatus,
  EOutputStatus,
  EOutputType,
  ESchedulePostStatus,
} from '@/core/enums';
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

  @Prop({
    type: MongooseSchema.Types.Map,
    of: MongooseSchema.Types.Mixed,
    required: false,
  })
  extras?: Record<string, unknown>;
}

@Schema({ _id: false })
export class RawContentItemModel {
  @Prop({ required: true })
  fileId: string;

  @Prop({ type: String, required: false, maxlength: 5000 })
  rawContent?: string;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CampaignParticipantSubModel {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'KolProfileModel' })
  kol_profile_id: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(EParticipantStatus),
  })
  status: EParticipantStatus;

  @Prop({ type: Date, default: null })
  joined_at: Date | null;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}
export const CampaignParticipantSubSchema = SchemaFactory.createForClass(
  CampaignParticipantSubModel,
);

// @code-comment(CampaignKOLOutputSubModel): Kept for future reuse when schedule posts are re-inlined.
// export class CampaignKOLOutputSubModel { ... }
// export const CampaignKOLOutputSubSchema = SchemaFactory.createForClass(CampaignKOLOutputSubModel);

// @code-comment(CampaignEnterpriseOutputSubModel): Kept for future reuse.
// export class CampaignEnterpriseOutputSubModel { ... }
// export const CampaignEnterpriseOutputSubSchema = SchemaFactory.createForClass(CampaignEnterpriseOutputSubModel);

// @code-comment(SchedulePostModel): Kept for future reuse.
// export class SchedulePostModel { ... }
// export const SchedulePostSchema = SchemaFactory.createForClass(SchedulePostModel);

@Schema({ _id: false })
export class ScheduleDayModel {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String, required: false })
  label?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'ScheduledPostModel' }],
    default: [],
  })
  posts: Types.ObjectId[]; // ScheduledPost IDs
}
export const ScheduleDaySchema = SchemaFactory.createForClass(ScheduleDayModel);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CampaignScheduleModel {
  @Prop({ type: [ScheduleDaySchema], default: [] })
  timeline: ScheduleDayModel[];

  created_at: Date;
  updated_at: Date;
}
export const CampaignScheduleSchema = SchemaFactory.createForClass(
  CampaignScheduleModel,
);

@Schema({
  collection: 'campaigns',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CampaignModel {
  @Prop({ required: true, type: Types.ObjectId, ref: 'UserModel' })
  owner_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'EnterpriseModel' })
  enterprise_id: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  budget: number;

  @Prop({
    type: MongooseSchema.Types.Map,
    of: MongooseSchema.Types.Mixed,
    required: true,
  })
  financial_target: Record<string, unknown>;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 2000,
  })
  description: string;

  @Prop({ type: [PlatformTargetItemModel], default: [] })
  platform_target: PlatformTargetItemModel[];

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ECampaignStatus),
    default: ECampaignStatus.DRAFT,
  })
  status: ECampaignStatus;

  @Prop({ type: [String], default: [] })
  collaborator_ids: string[];

  @Prop({ type: [RawContentItemModel], default: [] })
  raw_contents: RawContentItemModel[];

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  @Prop({ type: [CampaignParticipantSubSchema], default: [] })
  participants: CampaignParticipantSubModel[];

  @Prop({
    type: MongooseSchema.Types.Map,
    of: MongooseSchema.Types.Mixed,
    required: false,
  })
  extras?: Record<string, unknown>;

  @Prop({ type: CampaignScheduleSchema, required: false })
  schedule?: CampaignScheduleModel;

  created_at: Date;
  updated_at: Date;
}

export type CampaignDocument = HydratedDocument<CampaignModel>;
export const CampaignSchema = SchemaFactory.createForClass(CampaignModel);
CampaignSchema.plugin(softDeletePlugin);
