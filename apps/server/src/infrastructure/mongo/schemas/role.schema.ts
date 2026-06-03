import { ERoleType } from '@/core/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'roles',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class RoleModel {
  @Prop({ type: MongooseSchema.Types.String, required: true, unique: true })
  title: string;

  @Prop({ type: [MongooseSchema.Types.String], default: [] })
  permissions: string[];

  @Prop({ type: MongooseSchema.Types.String, enum: ERoleType, required: true })
  type: ERoleType;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type RoleDocument = HydratedDocument<RoleModel>;
export const RoleSchema = SchemaFactory.createForClass(RoleModel);
