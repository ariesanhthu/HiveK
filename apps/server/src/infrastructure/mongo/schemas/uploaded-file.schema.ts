import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TargetType } from '@/core/enums/target-type.enum';

@Schema({
  collection: 'uploaded_files',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UploadedFileModel {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  public_id: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  format: string;

  @Prop({ type: String, default: null })
  title: string | null;

  @Prop({ type: String, required: true, enum: TargetType })
  target_type: TargetType;

  @Prop({ required: true })
  target_id: string;

  @Prop({ required: true })
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
