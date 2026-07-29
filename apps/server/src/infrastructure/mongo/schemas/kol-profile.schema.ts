import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import type { JsonObject } from '@/core/types/common.type';
import { softDeletePlugin } from '../utils';

@Schema({ _id: false })
export class NativePlatformInfo {
  @Prop({ type: Types.ObjectId, ref: 'PlatformModel', required: true })
  platform_id: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  uniqueId: string;

  @Prop({ type: String, required: true, trim: true })
  external_id: string;

  @Prop({ type: Number, default: 0, min: 0 })
  follower_count: number;

  @Prop({ type: Number, default: 0, min: 0 })
  avg_engagement: number;

  @Prop({ type: [String], default: [] })
  top_tags: string[];

  @Prop({ type: [String], default: [] })
  categories: string[];
}

@Schema({
  collection: 'influencers',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class KolProfileModel {
  @Prop({ type: Types.ObjectId, ref: 'UserModel', default: null })
  user_id: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  verification_type: string | null;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200,
  })
  name: string;

  @Prop({ type: String, trim: true })
  location: string;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  bio: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  })
  email: string;

  @Prop({
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number'],
  })
  phone: string;

  @Prop({
    type: [SchemaFactory.createForClass(NativePlatformInfo)],
    default: [],
  })
  platforms: NativePlatformInfo[];

  @Prop({ type: Boolean, default: false })
  is_verified: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  scores: JsonObject;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type KolProfileDocument = HydratedDocument<KolProfileModel>;
export const KolProfileSchema = SchemaFactory.createForClass(KolProfileModel);
KolProfileSchema.plugin(softDeletePlugin);
