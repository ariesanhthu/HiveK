import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EPaymentEventType } from '@/core';
import { PaymentModel } from './payment.schema';
import { transactionPlugin } from '@sgod-mongodb/library/plugins';

export type PaymentEventDocument = HydratedDocument<PaymentEventModel>;

@Schema({ collection: 'payment_events', timestamps: false })
export class PaymentEventModel {
	@Prop({ type: String, ref: PaymentModel.name, required: true })
	payment_id: string;

	@Prop({ type: String, required: false, default: null })
	payment_attempt_id: string | null;

	@Prop({ type: String, required: true, enum: EPaymentEventType })
	event_type: EPaymentEventType;

	@Prop({ type: String, required: true, enum: ['USER', 'ADMIN', 'SYSTEM'] })
	trigger_type: string;

	@Prop({ type: String, required: true })
	triggered_by: string;

	@Prop({ type: Object, required: true, default: {} })
	field_changes: Record<string, { old: unknown; new: unknown }>;

	@Prop({ type: Date, required: true })
	occurred_at: Date;

	_id?: string;

	@Virtual({
		get: function (this: { _id?: Types.ObjectId }) {
			return this._id?.toString();
		},
	})
	id?: string;
}

export const PaymentEventSchema = SchemaFactory.createForClass(PaymentEventModel);

// Add virtual id
PaymentEventSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
	return this._id;
});

// Indexes
PaymentEventSchema.index({ payment_id: 1 });
// PaymentEventSchema.index({ occurredAt: 1 });

PaymentEventSchema.plugin(transactionPlugin);
