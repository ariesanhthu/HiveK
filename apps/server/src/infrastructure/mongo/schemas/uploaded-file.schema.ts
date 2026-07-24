import { TargetType } from '@/core/enums/target-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'uploaded_files',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UploadedFileModel {
  @Prop({ type: MongooseSchema.Types.String, required: true, trim: true })
  url: string;

  @Prop({ type: MongooseSchema.Types.String, required: true, trim: true })
  public_id: string;

  @Prop({ type: MongooseSchema.Types.Number, required: true, min: 0 })
  size: number;

  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    lowercase: true,
    trim: true,
  })
  format: string;

  @Prop({
    type: MongooseSchema.Types.String,
    default: null,
    trim: true,
    maxlength: 500,
  })
  title: string | null;

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: TargetType })
  target_type: TargetType;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  target_id: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  target_field: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type UploadedFileDocument = HydratedDocument<UploadedFileModel>;
export const UploadedFileSchema = SchemaFactory.createForClass(UploadedFileModel);
UploadedFileSchema.plugin(softDeletePlugin);
