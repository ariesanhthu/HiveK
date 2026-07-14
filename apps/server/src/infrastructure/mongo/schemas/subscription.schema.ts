import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ESubscriptionStatus } from '@/core/enums';
import { GrantSchema } from './package.schema';

export type SubscriptionDocument = HydratedDocument<SubscriptionModel>;

@Schema({ _id: false })
class PlanItemSchema {
  @Prop({ type: String, required: true })
  package_id: string;

  @Prop({ type: String, required: true })
  package_variant_id: string;

  @Prop({ type: Date, required: true })
  start_date: Date;

  @Prop({ type: Date, required: true })
  expires_at: Date;

  @Prop({ type: String, required: true })
  bill_id: string;

  @Prop({ type: Boolean, required: true })
  auto_renew: boolean;
}

@Schema({ _id: false })
class AddonItemSchema {
  @Prop({ type: String, required: true })
  package_id: string;

  @Prop({ type: String, required: true })
  package_variant_id: string;

  @Prop({ type: Date, required: true })
  purchased_at: Date;

  @Prop({ type: Date, required: false, default: null })
  expires_at: Date | null;

  @Prop({ type: String, required: true })
  bill_id: string;
}

@Schema({
  collection: 'subscriptions',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class SubscriptionModel {
  @Prop({ type: String, required: true, unique: true, index: true })
  enterprise_id: string;

  @Prop({
    type: String,
    required: true,
    enum: ESubscriptionStatus,
    default: ESubscriptionStatus.ACTIVE,
  })
  status: ESubscriptionStatus;

  @Prop({ type: PlanItemSchema, required: false, default: null })
  plan_item: PlanItemSchema | null;

  @Prop({ type: [AddonItemSchema], required: false, default: [] })
  addon_items: AddonItemSchema[];

  @Prop({ type: [GrantSchema], required: false, default: [] })
  computed_grants: GrantSchema[];

  @Prop({ type: [String], required: false, default: [] })
  computed_permissions: string[];

  @Prop({ type: Number, required: true, default: 1 })
  version: number;

  @Prop({ type: Date, required: false, index: true })
  next_expiry_check_at: Date;

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id == null ? undefined : String(this._id);
    },
  })
  id?: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(SubscriptionModel);
SubscriptionSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
  return this._id == null ? undefined : this._id;
});
