import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ERoleType } from '@/core/enums';

@Schema({
  collection: 'users',
  discriminatorKey: 'type',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UserModel {
  @Prop({ type: MongooseSchema.Types.String, required: true, unique: true })
  email: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  phone: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  password_hash: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  full_name: string;

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

  @Prop({ type: MongooseSchema.Types.String, default: null })
  avatar: string | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  google_id: string | null;

  created_at: Date;
  updated_at: Date;  
}

export type UserDocument = HydratedDocument<UserModel>;
export const UserSchema = SchemaFactory.createForClass(UserModel);

// --- Discriminators ---

@Schema()
export class AdminModel extends UserModel {}
export const AdminSchema = SchemaFactory.createForClass(AdminModel);

@Schema()
export class EnterpriseUserModel extends UserModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EnterpriseModel', required: true })
  enterprise_id: MongooseSchema.Types.ObjectId;
}
export const EnterpriseUserSchema = SchemaFactory.createForClass(EnterpriseUserModel);

@Schema()
export class KOLUserModel extends UserModel {}
export const KOLUserSchema = SchemaFactory.createForClass(KOLUserModel);
