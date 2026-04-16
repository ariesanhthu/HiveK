import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
class NativePlatformInfo {
  @Prop({ required: true })
  platform_id: string;

  @Prop({ required: true })
  handle: string;

  @Prop({ required: true })
  external_id: string;

  @Prop({ default: 0 })
  follower_count: number;

  @Prop({ default: 0 })
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
  @Prop({ required: true })
  name: string;

  @Prop()
  location: string;

  @Prop()
  gender: string;

  @Prop()
  bio: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ type: [SchemaFactory.createForClass(NativePlatformInfo)], default: [] })
  platforms: NativePlatformInfo[];

  @Prop({ default: false })
  is_verified: boolean;
}

export type KolProfileDocument = HydratedDocument<KolProfileModel>;
export const KolProfileSchema = SchemaFactory.createForClass(KolProfileModel);
