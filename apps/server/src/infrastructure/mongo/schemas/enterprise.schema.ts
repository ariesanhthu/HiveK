import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'enterprises',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class EnterpriseModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserModel', required: true, unique: true })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.String, required: true, trim: true, minlength: 1, maxlength: 200 })
  company_name: string;

  @Prop({ type: MongooseSchema.Types.String, required: true, trim: true, maxlength: 2000 })
  description: string;

  @Prop({ 
    type: MongooseSchema.Types.String,
    required: true, 
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  })
  contact_email: string;

  @Prop({ 
    type: MongooseSchema.Types.String,
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number']
  })
  contact_phone: string;

  @Prop({ type: MongooseSchema.Types.String, default: null, trim: true })
  website: string | null;

  @Prop({ type: MongooseSchema.Types.String, default: null, trim: true })
  tax_id: string | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UploadedFileModel', default: null })
  logo_url_id: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.Boolean, default: false })
  is_verified: boolean;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type EnterpriseDocument = HydratedDocument<EnterpriseModel>;
export const EnterpriseSchema = SchemaFactory.createForClass(EnterpriseModel);
EnterpriseSchema.plugin(softDeletePlugin);
