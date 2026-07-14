import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuotaUsageDocument = HydratedDocument<QuotaUsageModel>;

@Schema({ _id: false })
class RenewableUsageSchema {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: Number, required: true })
  allocated: number;

  @Prop({ type: Number, required: true })
  used: number;

  @Prop({ type: Date, required: true })
  cycle_start_at: Date;

  @Prop({ type: Date, required: true })
  cycle_ends_at: Date;
}

@Schema({
  collection: 'quota_usages',
  timestamps: { createdAt: false, updatedAt: 'updated_at' },
})
export class QuotaUsageModel {
  @Prop({ type: String, required: true, unique: true, index: true })
  enterprise_id: string;

  @Prop({ type: Date, required: true })
  cycle_anchor_date: Date;

  @Prop({ type: [RenewableUsageSchema], required: false, default: [] })
  usages: RenewableUsageSchema[];

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id == null ? undefined : String(this._id);
    },
  })
  id?: string;

  updated_at?: Date;
}

export const QuotaUsageSchema = SchemaFactory.createForClass(QuotaUsageModel);
QuotaUsageSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
  return this._id == null ? undefined : this._id;
});
QuotaUsageSchema.index({ 'usages.cycle_ends_at': 1 });
