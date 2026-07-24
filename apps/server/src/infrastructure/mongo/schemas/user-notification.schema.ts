import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'user_notifications',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UserNotificationModel {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'NotificationModel',
  })
  notification_id: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserModel',
  })
  recipient_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Boolean, required: true, default: false })
  is_read: boolean;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  read_at: Date | null;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type UserNotificationDocument = HydratedDocument<UserNotificationModel>;
export const UserNotificationSchema = SchemaFactory.createForClass(
  UserNotificationModel,
);
