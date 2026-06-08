import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { EParticipantStatus, EOutputStatus, EOutputType } from '@/core/enums';

export type CampaignParticipantDocument = HydratedDocument<CampaignParticipantModel>;


@Schema()
export class CampaignOutputModel {
  _id: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'PlatformModel' })
  platform_id: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.String, enum: EOutputType })
  output_type: EOutputType;

  @Prop({ required: true, type: MongooseSchema.Types.String })
  title: string;

  @Prop({ required: true, type: MongooseSchema.Types.Boolean })
  is_schedule_for_post: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UploadedFileModel', default: null })
  file_id: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  scheduled_at: Date | null;

  @Prop({ required: true, type: MongooseSchema.Types.String, enum: EOutputStatus })
  status: EOutputStatus;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  url: string | null;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  posted_at: Date | null;

  @Prop({ type: MongooseSchema.Types.Boolean, default: false })
  is_tracking_active: boolean;
}

export const CampaignOutputSchema = SchemaFactory.createForClass(CampaignOutputModel);

@Schema({
  collection: 'campaign_participants',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CampaignParticipantModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'CampaignModel' })
  campaign_id: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'KolProfileModel' })
  kol_profile_id: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.String, enum: EParticipantStatus })
  status: EParticipantStatus;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  joined_at: Date | null;

  @Prop({ type: [CampaignOutputSchema], default: [] })
  outputs: CampaignOutputModel[];

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export const CampaignParticipantSchema = SchemaFactory.createForClass(CampaignParticipantModel);
