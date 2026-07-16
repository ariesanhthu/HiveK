import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus } from '@/core/enums';

@Schema({
  collection: 'enterprise_invitations',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class EnterpriseInvitationModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EnterpriseModel', required: true })
  enterprise_id: MongooseSchema.Types.ObjectId;

  @Prop({ 
    type: MongooseSchema.Types.String, 
    required: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  })
  email: string;

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: EEnterpriseMemberMode })
  mode: EEnterpriseMemberMode;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserModel', required: true })
  inviter_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.String, required: true, enum: EEnterpriseInvitationStatus, default: EEnterpriseInvitationStatus.PENDING })
  status: EEnterpriseInvitationStatus;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  expires_at: Date;

  created_at: Date;
  updated_at: Date;
}

export type EnterpriseInvitationDocument = HydratedDocument<EnterpriseInvitationModel>;
export const EnterpriseInvitationSchema = SchemaFactory.createForClass(EnterpriseInvitationModel);
