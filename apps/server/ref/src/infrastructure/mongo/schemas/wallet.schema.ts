import { ECurrency } from '@/core';
import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { transactionPlugin } from '@sgod-mongodb/library/plugins';

export type WalletDocument = HydratedDocument<WalletModel>;

@Schema({ collection: 'wallets', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class WalletModel {
	@Prop({ type: String, required: true, unique: true, index: true })
	enterprise_id: string;

	@Prop({ type: Number, required: true, default: 0 })
	balance_amount: number;

	@Prop({ type: String, required: true, default: 'VND' })
	balance_currency: ECurrency;

	_id?: string;

	@Virtual({
		get: function (this: { _id?: Types.ObjectId }) {
			return this._id == null ? undefined : String(this._id);
		},
	})
	id?: string;
}

export const WalletSchema = SchemaFactory.createForClass(WalletModel);
WalletSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
	return this._id == null ? undefined : this._id;
});

WalletSchema.plugin(transactionPlugin);
