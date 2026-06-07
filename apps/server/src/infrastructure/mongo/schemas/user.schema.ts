import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ERoleType } from '@/core/enums';
import { softDeletePlugin } from '../utils';

@Schema({
  collection: 'users',
  discriminatorKey: 'type',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UserModel {
  @Prop({ 
    type: MongooseSchema.Types.String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  })
  email: string;

  @Prop({ 
    type: MongooseSchema.Types.String, 
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number']
  })
  phone: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  password_hash: string;

  @Prop({ type: MongooseSchema.Types.String, required: true, trim: true, minlength: 1, maxlength: 100 })
  full_name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UploadedFileModel', required: false, default: null })
  avatar: MongooseSchema.Types.ObjectId | null;

  type: ERoleType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'RoleModel', required: true })
  role_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Boolean, default: false })
  is_email_verified: boolean;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  refresh_token: string | null;

  @Prop({ type: MongooseSchema.Types.String, default: null, unique: true, sparse: true })
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
AdminSchema.plugin(softDeletePlugin);

@Schema()
export class EnterpriseUserModel extends UserModel {
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'EnterpriseModel', required: false, default: [] })
  enterprise_ids: MongooseSchema.Types.ObjectId[];
}
export const EnterpriseUserSchema = SchemaFactory.createForClass(EnterpriseUserModel);
EnterpriseUserSchema.plugin(softDeletePlugin);

@Schema()
export class KOLUserModel extends UserModel {}
export const KOLUserSchema = SchemaFactory.createForClass(KOLUserModel);
KOLUserSchema.plugin(softDeletePlugin);
