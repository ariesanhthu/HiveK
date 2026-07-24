import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'platforms',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class PlatformModel {
  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  })
  name: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please fill a valid URL'],
  })
  base_url: string;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    enum: Object.values(PlatformApiStatus),
    default: PlatformApiStatus.STABLE,
  })
  api_status: PlatformApiStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UploadedFileModel',
    default: null,
  })
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
PlatformSchema.plugin(softDeletePlugin);
