import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { transactionPlugin } from '@sgod-mongodb/library/plugins';

export type OutboxEventDocument = HydratedDocument<OutboxEventModel>;

@Schema({ collection: 'outbox_events', timestamps: false })
export class OutboxEventModel {
	@Prop({ type: String, required: true })
	event_type: string;

	@Prop({ type: Object, required: true })
	payload: Record<string, unknown>;

	@Prop({
		type: String,
		required: true,
		enum: ['PENDING', 'PROCESSED', 'FAILED'],
		default: 'PENDING',
	})
	status: string;

	@Prop({ type: Number, required: true, default: 0 })
	attempts: number;

	@Prop({ type: String, required: false })
	last_error?: string;

	@Prop({ type: Date, required: true, default: Date.now })
	created_at: Date;

	@Prop({ type: Date, required: false })
	processed_at?: Date;

	@Prop({ type: Object, required: false, default: null })
	metadata?: Record<string, unknown> | null;

	@Prop({ type: Object, required: false, default: null })
	transport?: Record<string, unknown> | null;

	_id?: string;

	@Virtual({
		get: function (this: { _id?: Types.ObjectId }) {
			return this._id;
		},
	})
	id?: string;
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEventModel);

OutboxEventSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
	return this._id;
});

OutboxEventSchema.index({ status: 1, created_at: 1 });

OutboxEventSchema.plugin(transactionPlugin);
