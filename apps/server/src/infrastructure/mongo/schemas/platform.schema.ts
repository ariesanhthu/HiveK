import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

@Schema({
  collection: 'platforms',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class PlatformModel {
  @Prop({ required: true, unique: true, lowercase: true })
  name: string;

  @Prop({ required: true })
  base_url: string;

  @Prop({ required: true, enum: PlatformApiStatus, default: PlatformApiStatus.STABLE })
  api_status: PlatformApiStatus;

  @Prop({ required: true })
  icon_url: string;
}

export type PlatformDocument = HydratedDocument<PlatformModel>;
export const PlatformSchema = SchemaFactory.createForClass(PlatformModel);
