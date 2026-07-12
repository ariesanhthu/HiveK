import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EPostStatus } from '@/core/enums/post-status.enum';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'scheduled_posts',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class ScheduledPostModel {
  @Prop({ type: Types.ObjectId, ref: 'EnterpriseModel', required: true })
  enterprise_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SocialPageModel', required: true })
  social_page_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  platform_code: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [{ type: String }] })
  media_file_ids: string[];

  @Prop({ type: Date, required: true })
  scheduled_at: Date;

  @Prop({ type: String, enum: Object.values(EPostStatus), required: true, default: EPostStatus.DRAFT })
  status: EPostStatus;

  @Prop({ type: Date, default: null })
  published_at: Date | null;

  @Prop({ type: String, default: null })
  platform_post_id: string | null;

  @Prop({ type: String, default: null })
  fail_reason: string | null;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', required: true })
  created_by: Types.ObjectId;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type ScheduledPostDocument = HydratedDocument<ScheduledPostModel>;
export const ScheduledPostSchema = SchemaFactory.createForClass(ScheduledPostModel);
ScheduledPostSchema.plugin(softDeletePlugin);
