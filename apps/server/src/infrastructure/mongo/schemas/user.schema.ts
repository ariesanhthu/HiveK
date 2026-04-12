import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserType } from '@/core/enums/user-type.enum';

@Schema({
  collection: 'users',
  discriminatorKey: 'type',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UserModel {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true })
  full_name: string;

  type: UserType;

  @Prop({ required: true })
  role_id: string;

  @Prop({ default: false })
  is_email_verified: boolean;
}

export type UserDocument = HydratedDocument<UserModel>;
export const UserSchema = SchemaFactory.createForClass(UserModel);

// --- Discriminators ---

@Schema()
export class AdminModel extends UserModel {}
export const AdminSchema = SchemaFactory.createForClass(AdminModel);

@Schema()
export class EnterpriseUserModel extends UserModel {
  @Prop({ required: true })
  enterprise_id: string;
}
export const EnterpriseUserSchema = SchemaFactory.createForClass(EnterpriseUserModel);

@Schema()
export class KOLUserModel extends UserModel {}
export const KOLUserSchema = SchemaFactory.createForClass(KOLUserModel);
