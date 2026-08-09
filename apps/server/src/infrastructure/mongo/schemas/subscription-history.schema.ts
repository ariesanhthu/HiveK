import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GrantSchema } from './package.schema';

@Schema({ _id: false, timestamps: false })
export class SubscriptionChangeDetailsModel {
  @Prop({ type: String, required: false, default: null })
  old_plan_id: string | null;

  @Prop({ type: String, required: false, default: null })
  new_plan_id: string | null;

  @Prop({ type: [String], required: true })
  added_addon_ids: string[];

  @Prop({ type: [String], required: true })
  removed_addon_ids: string[];

  @Prop({ type: [GrantSchema], required: true, default: [] })
  old_grants: GrantSchema[];

  @Prop({ type: [GrantSchema], required: true, default: [] })
  new_grants: GrantSchema[];

  @Prop({ type: [String], required: true })
  old_permissions: string[];

  @Prop({ type: [String], required: true })
  new_permissions: string[];
}
const SubscriptionChangeDetailsSchema = SchemaFactory.createForClass(
  SubscriptionChangeDetailsModel,
);

export type SubscriptionHistoryDocument =
  HydratedDocument<SubscriptionHistoryModel>;

@Schema({
  collection: 'subscription_history',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class SubscriptionHistoryModel {
  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ type: String, required: true, index: true })
  subscription_id: string;

  @Prop({ type: String, required: false })
  bill_id?: string;

  @Prop({ type: String, required: false })
  actor_id?: string;

  @Prop({ type: SubscriptionChangeDetailsSchema, required: true })
  details: SubscriptionChangeDetailsModel;
}

export const SubscriptionHistorySchema = SchemaFactory.createForClass(
  SubscriptionHistoryModel,
);
