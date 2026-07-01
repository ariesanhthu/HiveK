import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EWalletTransactionType } from '@/core';
import { ECurrency } from '@/core';
import type { JsonRecord } from '@/shared/types';
import { transactionPlugin } from '@sgod-mongodb/library/plugins';

export type WalletTransactionDocument = HydratedDocument<WalletTransactionModel>;

@Schema({
	collection: 'wallet_transactions',
	timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class WalletTransactionModel {
	@Prop({ type: String, required: true, index: true })
	wallet_id: string;

	@Prop({ type: String, required: true, enum: EWalletTransactionType })
	type: EWalletTransactionType;

	@Prop({ type: Number, required: true })
	amount: number;

	@Prop({ type: String, required: true, enum: ECurrency })
	currency: ECurrency;

	@Prop({ type: String, required: false, index: true })
	bill_id?: string;

	@Prop({ type: String, required: true, unique: true, index: true })
	idempotency_key: string;

	@Prop({ type: String, required: false })
	description: string;

	@Prop({ type: Object, required: false })
	metadata?: JsonRecord;

	_id?: string;

	@Virtual({
		get: function (this: { _id?: Types.ObjectId }) {
			return this._id == null ? undefined : String(this._id);
		},
	})
	id?: string;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransactionModel);
WalletTransactionSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
	return this._id == null ? undefined : this._id;
});

WalletTransactionSchema.plugin(transactionPlugin);
