import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TargetType } from '@/core/enums/target-type.enum';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'uploaded_files',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UploadedFileModel {
  @Prop({ type: String, required: true, trim: true })
  url: string;

  @Prop({ type: String, required: true, trim: true })
  public_id: string;

  @Prop({ type: Number, required: true, min: 0 })
  size: number;

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  format: string;

  @Prop({ type: String, default: null, trim: true, maxlength: 500 })
  title: string | null;

  @Prop({ type: String, required: true, enum: TargetType })
  target_type: TargetType;

  @Prop({ type: String, required: true })
  target_id: string;

  @Prop({ type: String, required: true })
  target_field: string;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type UploadedFileDocument = HydratedDocument<UploadedFileModel>;
export const UploadedFileSchema = SchemaFactory.createForClass(UploadedFileModel);
UploadedFileSchema.plugin(softDeletePlugin);
