import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { JsonRecord } from '@/shared/types';
import { transactionPlugin } from '@sgod-mongodb/library/plugins';

@Schema({ _id: false, timestamps: false })
export class SubscriptionChangeDetailsModel {
	@Prop({ type: [String], required: true })
	oldPackages: string[];

	@Prop({ type: [String], required: true })
	newPackages: string[];

	@Prop({ type: Object, required: true })
	oldQuotas: Record<string, any>;

	@Prop({ type: Object, required: true })
	newQuotas: Record<string, any>;

	@Prop({ type: [String], required: true })
	oldPermissions: string[];

	@Prop({ type: [String], required: true })
	newPermissions: string[];
}
const SubscriptionChangeDetailsSchema = SchemaFactory.createForClass(SubscriptionChangeDetailsModel);

export type SubscriptionHistoryDocument = HydratedDocument<SubscriptionHistoryModel>;

@Schema({
	collection: 'subscription_history',
	timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class SubscriptionHistoryModel {
	@Prop({ type: String, required: true, index: true })
	enterprise_id: string;

	@Prop({ type: String, required: true, index: true })
	subscription_id: string;

	@Prop({ type: String, required: false })
	bill_id?: string;

	@Prop({ type: String, required: false })
	actor_id?: string;

	@Prop({ type: SubscriptionChangeDetailsSchema, required: true })
	details: SubscriptionChangeDetailsModel;

	_id?: string;

	@Virtual({
		get: function (this: { _id?: Types.ObjectId }) {
			return this._id == null ? undefined : String(this._id);
		},
	})
	id?: string;
}

export const SubscriptionHistorySchema = SchemaFactory.createForClass(SubscriptionHistoryModel);
SubscriptionHistorySchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
	return this._id == null ? undefined : this._id;
});

SubscriptionHistorySchema.plugin(transactionPlugin);
