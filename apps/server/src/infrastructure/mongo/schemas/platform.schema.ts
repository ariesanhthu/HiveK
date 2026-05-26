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

  @Prop({ type: String, required: true, enum: PlatformApiStatus, default: PlatformApiStatus.STABLE })
  api_status: PlatformApiStatus;

  @Prop({ required: true })
  icon_url: string;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;
}

export type PlatformDocument = HydratedDocument<PlatformModel>;
export const PlatformSchema = SchemaFactory.createForClass(PlatformModel);
