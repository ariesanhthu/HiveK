import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'roles',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class RoleModel {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: false })
  is_blocked: boolean;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type RoleDocument = HydratedDocument<RoleModel>;
export const RoleSchema = SchemaFactory.createForClass(RoleModel);
