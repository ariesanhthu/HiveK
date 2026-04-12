
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

  @Prop()
  website?: string;

  @Prop()
  tax_id?: string;

  @Prop()
  logo_url?: string;

  @Prop({ default: false })
  is_verified: boolean;
}

export type EnterpriseDocument = HydratedDocument<EnterpriseModel>;
export const EnterpriseSchema = SchemaFactory.createForClass(EnterpriseModel);
