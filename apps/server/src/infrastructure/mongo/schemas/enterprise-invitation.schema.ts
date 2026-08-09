import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  EEnterpriseMemberMode,
  EEnterpriseInvitationStatus,
} from '@/core/enums';

@Schema({
  collection: 'enterprise_invitations',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class EnterpriseInvitationModel {
  @Prop({ type: Types.ObjectId, ref: 'EnterpriseModel', required: true })
  enterprise_id: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  })
  email: string;

  @Prop({ type: String, required: true, enum: EEnterpriseMemberMode })
  mode: EEnterpriseMemberMode;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', required: true })
  inviter_id: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: EEnterpriseInvitationStatus,
    default: EEnterpriseInvitationStatus.PENDING,
  })
  status: EEnterpriseInvitationStatus;

  @Prop({ type: Date, required: true })
  expires_at: Date;

  created_at: Date;
  updated_at: Date;
}

export type EnterpriseInvitationDocument =
  HydratedDocument<EnterpriseInvitationModel>;
export const EnterpriseInvitationSchema = SchemaFactory.createForClass(
  EnterpriseInvitationModel,
);
