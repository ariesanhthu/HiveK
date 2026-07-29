import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  EBillType,
  EBillStatus,
  EPurchaseType,
  EBillLineType,
} from '@/core/enums';

export type BillDocument = HydratedDocument<BillModel>;

@Schema({ _id: false })
class BillItemSchema {
  @Prop({ type: String, required: true, enum: EBillLineType })
  line_type: EBillLineType;

  @Prop({ type: String, required: false, default: null })
  package_id: string | null;

  @Prop({ type: String, required: false, default: null })
  package_variant_id: string | null;

  @Prop({ type: String, required: false, default: null })
  credit_type: string | null;

  @Prop({ type: Number, required: false, default: null })
  credit_amount: number | null;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  tax_percent: number;

  @Prop({ type: String, required: true, enum: EPurchaseType })
  purchase_type: EPurchaseType;
}

@Schema({
  collection: 'bills',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class BillModel {
  @Prop({ type: String, required: true, unique: true, index: true })
  bill_code: string;

  @Prop({ type: String, required: true, index: true })
  enterprise_id: string;

  @Prop({ type: String, required: true, enum: EBillType })
  type: EBillType;

  @Prop({
    type: String,
    required: true,
    enum: EBillStatus,
    default: EBillStatus.PENDING,
  })
  status: EBillStatus;

  @Prop({ type: [BillItemSchema], required: true })
  items: BillItemSchema[];

  @Prop({ type: Number, required: true })
  total_amount: number;

  @Prop({ type: Number, required: true, default: 0 })
  tax_amount: number;

  @Prop({ type: Number, required: true })
  final_amount: number;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: Date, required: false, default: null })
  expires_at: Date | null;

  @Prop({ type: Date, required: false })
  created_at?: Date;
}

export const BillSchema = SchemaFactory.createForClass(BillModel);
BillSchema.index({ enterprise_id: 1, status: 1 });
