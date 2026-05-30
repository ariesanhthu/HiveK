
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'enterprises',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class EnterpriseModel {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  company_name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  contact_email: string;

  @Prop({ required: true })
  contact_phone: string;

  @Prop({ type: String, default: null })
  website: string | null;

  @Prop({ type: String, default: null })
  tax_id: string | null;

  @Prop({ type: String, default: null })
  logo_url_id: string | null;

  @Prop({ default: false })
  is_verified: boolean;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type EnterpriseDocument = HydratedDocument<EnterpriseModel>;
export const EnterpriseSchema = SchemaFactory.createForClass(EnterpriseModel);
