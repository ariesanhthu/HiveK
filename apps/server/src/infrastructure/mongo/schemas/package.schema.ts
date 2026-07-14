import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EVersionStatus, EPackageType, EPackageScope, ECurrency, EGrantType } from '@/core/enums';

export type PackageDocument = HydratedDocument<PackageModel>;

@Schema({ _id: false })
export class GrantSchema {
  @Prop({ type: String, required: true, enum: EGrantType })
  type: EGrantType;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: Number, required: true })
  value: number;

  @Prop({ type: String, required: false, default: null })
  reset_cycle?: 'monthly' | 'weekly' | 'daily' | null;

  @Prop({
    type: {
      credit_type: { type: String, required: true },
      credits_per_unit: { type: Number, required: true },
    },
    required: false,
    default: null,
  })
  credit_fallback?: {
    credit_type: string;
    credits_per_unit: number;
  } | null;
}

@Schema({ _id: false })
class PackageVariantSchema {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: false, default: null })
  duration_months: number | null;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  price_after_discount: number;

  @Prop({ type: Number, required: true })
  tax: number;

  @Prop({ type: String, required: true })
  currency: ECurrency;

  @Prop({ type: [GrantSchema], required: false, default: [] })
  extra_grants: GrantSchema[];

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id == null ? undefined : String(this._id);
    },
  })
  id?: string;
}

@Schema({
  collection: 'packages',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class PackageModel {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true, enum: EPackageType, index: true })
  type: EPackageType;

  @Prop({ type: String, required: true, enum: EPackageScope, index: true })
  scope: EPackageScope;

  @Prop({ type: String, required: false, default: null, index: true })
  enterprise_id: string | null;

  @Prop({
    type: String,
    required: true,
    enum: EVersionStatus,
    default: EVersionStatus.DRAFT,
    index: true,
  })
  status: EVersionStatus;

  @Prop({ type: [String], required: false, default: [] })
  features: string[];

  @Prop({ type: [GrantSchema], required: false, default: [] })
  base_grants: GrantSchema[];

  @Prop({ type: [PackageVariantSchema], required: false, default: [] })
  variants: PackageVariantSchema[];

  @Prop({ type: Date, required: false, default: null })
  activated_at: Date | null;

  @Prop({ type: Date, required: false })
  created_at?: Date;

  @Prop({ type: Date, required: false })
  updated_at?: Date;

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id == null ? undefined : String(this._id);
    },
  })
  id?: string;
}

export const PackageSchema = SchemaFactory.createForClass(PackageModel);
PackageSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
  return this._id == null ? undefined : this._id;
});
PackageSchema.index({ code: 1 }, { unique: true });
