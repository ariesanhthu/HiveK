import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

@Schema({
  collection: 'platforms',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class PlatformModel {
  @Prop({ type: MongooseSchema.Types.String, required: true, unique: true, lowercase: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  base_url: string;

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: PlatformApiStatus, default: PlatformApiStatus.STABLE })
  api_status: PlatformApiStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UploadedFileModel', default: null })
  icon: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type PlatformDocument = HydratedDocument<PlatformModel>;
export const PlatformSchema = SchemaFactory.createForClass(PlatformModel);
