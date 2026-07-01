import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EBillType, EBillStatus, EPurchaseType } from '@/core';
import { transactionPlugin } from '@sgod-mongodb/library/plugins';

export type BillDocument = HydratedDocument<BillModel>;

class BillItemSchema {
	@Prop({ type: String, required: true })
	package_id: string;

	@Prop({ type: String, required: true })
	package_variant_id: string;

	@Prop({ type: Number, required: true })
	price: number;

	@Prop({ type: Number, required: true })
	tax_percent: number;

	@Prop({ type: Number, required: false })
	credit_refund_amount?: number;

	@Prop({ type: String, required: true, enum: EPurchaseType })
	purchase_type: EPurchaseType;
}

@Schema({ collection: 'bills', timestamps: { createdAt: 'created_at', updatedAt: false } })
export class BillModel {
	@Prop({ type: String, required: true, unique: true, index: true })
	bill_code: string;

	@Prop({ type: String, required: true, index: true })
	enterprise_id: string;

	@Prop({ type: String, required: true, enum: EBillType })
	type: EBillType;

	@Prop({ type: String, required: true, enum: EBillStatus, default: EBillStatus.PENDING })
	status: EBillStatus;

	@Prop({ type: [Object], required: true })
	items: BillItemSchema[];

	@Prop({ type: Number, required: true })
	total_amount: number;

	@Prop({ type: Number, required: false, default: 0 })
	credit_amount_applied: number;

	@Prop({ type: Number, required: false })
	credit_amount_refund?: number;

	@Prop({ type: Number, required: true, default: 0 })
	tax_amount: number;

	@Prop({ type: Number, required: true })
	final_amount: number;

	@Prop({ type: String, required: true })
	currency: string;

	@Prop({ type: Date, required: false, default: null })
	expires_at: Date | null;

	_id?: string;

	@Virtual({
		get: function (this: { _id?: Types.ObjectId }) {
			return this._id == null ? undefined : String(this._id);
		},
	})
	id?: string;
}

export const BillSchema = SchemaFactory.createForClass(BillModel);
BillSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
	return this._id == null ? undefined : this._id;
});
BillSchema.index({ enterprise_id: 1, status: 1 });

BillSchema.plugin(transactionPlugin);
