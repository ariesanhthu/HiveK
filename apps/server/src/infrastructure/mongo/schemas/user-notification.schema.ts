import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  collection: 'user_notifications',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UserNotificationModel {
  @Prop({ required: true, type: Types.ObjectId, ref: 'NotificationModel' })
  notification_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'UserModel' })
  recipient_id: Types.ObjectId;

  @Prop({ type: Boolean, required: true, default: false })
  is_read: boolean;

  @Prop({ type: Date, default: null })
  read_at: Date | null;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type UserNotificationDocument = HydratedDocument<UserNotificationModel>;
export const UserNotificationSchema = SchemaFactory.createForClass(
  UserNotificationModel,
);

// Add indexes for common query patterns
UserNotificationSchema.index({ recipient_id: 1, delete_at: 1 });
UserNotificationSchema.index({ recipient_id: 1, is_read: 1 });
