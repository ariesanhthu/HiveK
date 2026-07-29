import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'auto_reply_rules',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class AutoReplyRuleModel {
  @Prop({ type: Types.ObjectId, ref: 'EnterpriseModel', required: true })
  enterprise_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SocialPageModel', required: true })
  social_page_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, required: true, default: true })
  is_enabled: boolean;

  @Prop({ type: [{ type: String }] })
  keywords: string[];

  @Prop({ type: String, required: true })
  reply_content: string;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type AutoReplyRuleDocument = HydratedDocument<AutoReplyRuleModel>;
export const AutoReplyRuleSchema =
  SchemaFactory.createForClass(AutoReplyRuleModel);
AutoReplyRuleSchema.plugin(softDeletePlugin);
