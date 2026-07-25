import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'social_pages',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class SocialPageModel {
  @Prop({ type: Types.ObjectId, ref: 'EnterpriseModel', required: true })
  enterprise_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlatformModel', required: true })
  platform_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  platform_code: string;

  @Prop({ type: String, required: true })
  page_id: string;

  @Prop({ type: String, required: true })
  page_name: string;

  @Prop({ type: String, default: null })
  picture_url: string | null;

  @Prop({ type: Number, default: null })
  follower_count: number | null;

  @Prop({ type: String, required: true })
  encrypted_token: string;

  @Prop({ type: Date, default: null })
  token_expires_at: Date | null;

  @Prop({ type: String, required: true })
  webhook_verify_token: string;

  @Prop({ type: Boolean, required: true, default: true })
  is_active: boolean;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type SocialPageDocument = HydratedDocument<SocialPageModel>;
export const SocialPageSchema = SchemaFactory.createForClass(SocialPageModel);
SocialPageSchema.plugin(softDeletePlugin);
