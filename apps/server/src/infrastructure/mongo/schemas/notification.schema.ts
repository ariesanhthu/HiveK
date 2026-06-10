import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { NotificationType, TargetType } from '@/core/enums';

@Schema({
  collection: 'notifications',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class NotificationModel {
  @Prop({ required: true, type: MongooseSchema.Types.String, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, type: MongooseSchema.Types.String })
  title: string;

  @Prop({ required: true, type: MongooseSchema.Types.String })
  content: string;

  @Prop({ type: MongooseSchema.Types.String, enum: TargetType, default: null })
  target_type: TargetType | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  target_id: string | null;

  created_at: Date;
  updated_at: Date;
}

export type NotificationDocument = HydratedDocument<NotificationModel>;
export const NotificationSchema = SchemaFactory.createForClass(NotificationModel);
