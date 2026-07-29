import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'users',
  discriminatorKey: 'type',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UserModel {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number'],
  })
  phone: string;

  @Prop({ type: String, required: true })
  password_hash: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  })
  full_name: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'UploadedFileModel',
    required: false,
    default: null,
  })
  avatar: Types.ObjectId | null;

  type: string;

  @Prop({ type: Types.ObjectId, ref: 'RoleModel', required: true })
  role_id: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  is_email_verified: boolean;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  @Prop({ type: String, default: null })
  refresh_token: string | null;

  @Prop({ type: String, default: null })
  google_id: string | null;

  created_at: Date;
  updated_at: Date;
}

export type UserDocument = HydratedDocument<UserModel>;
export const UserSchema = SchemaFactory.createForClass(UserModel);
UserSchema.plugin(softDeletePlugin);

// --- Discriminators ---

@Schema()
export class AdminModel extends UserModel {}
export const AdminSchema = SchemaFactory.createForClass(AdminModel);
export type AdminUserDocument = HydratedDocument<AdminModel>;
AdminSchema.plugin(softDeletePlugin);

@Schema()
export class EnterpriseUserModel extends UserModel {
  @Prop({
    type: [Types.ObjectId],
    ref: 'EnterpriseModel',
    required: false,
    default: [],
  })
  enterprise_ids: Types.ObjectId[];
}
export const EnterpriseUserSchema =
  SchemaFactory.createForClass(EnterpriseUserModel);
export type EnterpriseUserDocument = HydratedDocument<EnterpriseUserModel>;
EnterpriseUserSchema.plugin(softDeletePlugin);

@Schema()
export class KOLUserModel extends UserModel {}
export const KOLUserSchema = SchemaFactory.createForClass(KOLUserModel);
export type KOLUserDocument = HydratedDocument<KOLUserModel>;
KOLUserSchema.plugin(softDeletePlugin);
