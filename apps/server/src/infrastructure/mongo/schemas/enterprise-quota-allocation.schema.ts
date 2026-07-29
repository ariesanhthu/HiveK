import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EGrantType } from '@/core/enums';

export type EnterpriseQuotaAllocationDocument =
  HydratedDocument<EnterpriseQuotaAllocationModel>;

@Schema({ _id: false })
class AllocationRowSchema {
  @Prop({ type: String, required: true })
  enterprise_id: string;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: Number, required: true })
  allocated: number;

  @Prop({ type: String, required: true, enum: EGrantType })
  kind: EGrantType;

  @Prop({ type: Boolean, required: true, default: false })
  is_pool: boolean;
}

@Schema({
  collection: 'enterprise_quota_allocations',
  timestamps: { createdAt: false, updatedAt: 'updated_at' },
})
export class EnterpriseQuotaAllocationModel {
  @Prop({ type: String, required: true, unique: true, index: true })
  owner_id: string;

  @Prop({ type: [AllocationRowSchema], required: false, default: [] })
  allocations: AllocationRowSchema[];

  updated_at?: Date;
}

export const EnterpriseQuotaAllocationSchema = SchemaFactory.createForClass(
  EnterpriseQuotaAllocationModel,
);
EnterpriseQuotaAllocationSchema.index({ owner_id: 1 }, { unique: true });
