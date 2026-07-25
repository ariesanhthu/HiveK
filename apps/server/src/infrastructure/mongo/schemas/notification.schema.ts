import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NotificationType, ETargetType } from '@/core/enums';

@Schema({
  collection: 'notifications',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class NotificationModel {
  @Prop({ required: true, type: String, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ type: String, enum: ETargetType, default: null })
  target_type: ETargetType | null;

  @Prop({ type: String, default: null })
  target_id: string | null;

  created_at: Date;
  updated_at: Date;
}

export type NotificationDocument = HydratedDocument<NotificationModel>;
export const NotificationSchema = SchemaFactory.createForClass(NotificationModel);

// Add indexes for common query patterns
NotificationSchema.index({ type: 1 });
