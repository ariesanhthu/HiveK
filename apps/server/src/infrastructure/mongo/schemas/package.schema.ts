import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EVersionStatus, EPackageType, EPackageScope, ECurrency } from '@/core/enums';

export type PackageDocument = HydratedDocument<PackageModel>;

@Schema({ _id: false })
class PackageFeatureSchema {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: [String], required: true })
  permissions: string[];
}

@Schema({ _id: false })
export class QuotaItemSchema {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Number, required: true })
  limit: number;
}

@Schema({ timestamps: false })
class PackageVariantSchema {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  duration_months: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  price_after_discount: number;

  @Prop({ type: Number, required: true })
  tax: number;

  @Prop({ type: String, required: true })
  currency: ECurrency;

  @Prop({ type: [QuotaItemSchema], required: false, default: [] })
  extra_quotas: QuotaItemSchema[];

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

  @Prop({ type: [PackageFeatureSchema], required: false, default: [] })
  features: PackageFeatureSchema[];

  @Prop({ type: [QuotaItemSchema], required: false, default: [] })
  base_quotas: QuotaItemSchema[];

  @Prop({ type: [PackageVariantSchema], required: false, default: [] })
  variants: PackageVariantSchema[];

  @Prop({ type: Date, required: false, default: null })
  activated_at: Date | null;

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
