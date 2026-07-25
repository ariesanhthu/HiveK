import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EOtpType } from '@/core/enums/otp-type.enum';

@Schema({
  collection: 'otps',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class OtpModel {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: true, enum: EOtpType })
  type: EOtpType;

  @Prop({ type: Date, required: true, expires: 0 })
  expired_at: Date;

  created_at: Date;
  updated_at: Date;
}

export type OtpDocument = HydratedDocument<OtpModel>;
export const OtpSchema = SchemaFactory.createForClass(OtpModel);
