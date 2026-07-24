import { EOutputStatus, EOutputType, EParticipantStatus, ESchedulePostStatus } from '@/core/enums';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
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
  others?: Record<string, any>;
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

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'KolProfileModel',
  })
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
}
export const CampaignParticipantSubSchema = SchemaFactory.createForClass(
  CampaignParticipantSubModel,
);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CampaignKOLOutputSubModel {
  _id: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  campaign_participant_id: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'PlatformModel',
  })
  platform_id: Types.ObjectId;

  @Prop({ type: String, default: null })
  unique_id: string | null;

  @Prop({ required: true, type: String, enum: Object.values(EOutputType) })
  output_type: EOutputType;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Boolean })
  is_schedule_for_post: boolean;

  @Prop({ type: Date, default: null })
  scheduled_at: Date | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UploadedFileModel',
    default: null,
  })
  file_id: Types.ObjectId | null;

  @Prop({ required: true, type: String, enum: Object.values(EOutputStatus) })
  status: EOutputStatus;

  @Prop({ type: String, default: null })
  url: string | null;

  @Prop({ type: Date, default: null })
  posted_at: Date | null;

  @Prop({ type: Boolean, default: false })
  is_tracking_active: boolean;
}
export const CampaignKOLOutputSubSchema = SchemaFactory.createForClass(
  CampaignKOLOutputSubModel,
);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CampaignEnterpriseOutputSubModel {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'PlatformModel',
  })
  platform_id: Types.ObjectId;

  @Prop({ type: String, default: null })
  unique_id: string | null;

  @Prop({ required: true, type: String, enum: Object.values(EOutputType) })
  output_type: EOutputType;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Boolean })
  is_schedule_for_post: boolean;

  @Prop({ type: Date, default: null })
  scheduled_at: Date | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UploadedFileModel',
    default: null,
  })
  file_id: Types.ObjectId | null;

  @Prop({ required: true, type: String, enum: Object.values(EOutputStatus) })
  status: EOutputStatus;

  @Prop({ type: String, default: null })
  url: string | null;

  @Prop({ type: Date, default: null })
  posted_at: Date | null;

  @Prop({ type: Boolean, default: false })
  is_tracking_active: boolean;
}
export const CampaignEnterpriseOutputSubSchema = SchemaFactory.createForClass(
  CampaignEnterpriseOutputSubModel,
);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class SchedulePostModel {
  @Prop({ required: true, type: Date })
  scheduled_time: Date;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'PlatformModel',
  })
  platform_id: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ESchedulePostStatus),
  })
  status: ESchedulePostStatus;

  @Prop({ type: [CampaignKOLOutputSubSchema], default: [] })
  campaign_kol_outputs: CampaignKOLOutputSubModel[];

  @Prop({ type: [CampaignEnterpriseOutputSubSchema], default: [] })
  campaign_enterprise_outputs: CampaignEnterpriseOutputSubModel[];
}
export const SchedulePostSchema = SchemaFactory.createForClass(SchedulePostModel);

@Schema({ _id: false })
export class ScheduleDayModel {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String, required: false })
  label?: string;

  @Prop({ type: [SchedulePostSchema], default: [] })
  posts: SchedulePostModel[];
}
export const ScheduleDaySchema = SchemaFactory.createForClass(ScheduleDayModel);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CampaignScheduleModel {
  @Prop({ type: [ScheduleDaySchema], default: [] })
  timeline: ScheduleDayModel[];
}
export const CampaignScheduleSchema = SchemaFactory.createForClass(
  CampaignScheduleModel,
);

@Schema({
  collection: 'campaigns',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CampaignModel {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserModel',
  })
  owner_id: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EnterpriseModel',
  })
  enterprise_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  budget: number;

  @Prop({
    type: MongooseSchema.Types.Map,
    of: MongooseSchema.Types.Mixed,
    required: true,
  })
  financial_target: Record<string, any>;

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

  @Prop({ type: CampaignScheduleSchema, required: false })
  schedule?: CampaignScheduleModel;

  created_at: Date;
  updated_at: Date;
}

export type CampaignDocument = HydratedDocument<CampaignModel>;
export const CampaignSchema = SchemaFactory.createForClass(CampaignModel);
CampaignSchema.plugin(softDeletePlugin);
