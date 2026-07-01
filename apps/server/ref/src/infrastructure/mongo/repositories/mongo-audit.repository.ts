import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { PaymentEventEntity, TriggerType } from '@/core';
import { IAuditRepository } from '@/core';
import { PaymentEventDocument, PaymentEventModel } from '../schemas';
import { PaymentEventGetByPaymentIdDto } from '@/application';
import { ESortOrder } from '@/shared/enums';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { PAYMENT_UNSCOPED_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoAuditRepository implements IAuditRepository {
	private readonly core: SgodMongooseRepositoryCore<PaymentEventEntity>;

	constructor(
		@InjectModel(PaymentEventModel.name)
		eventModel: Model<PaymentEventDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(eventModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<PaymentEventDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_UNSCOPED_FILTER_CONFIG
		);
	}

	async create(entity: PaymentEventEntity): Promise<PaymentEventEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: PaymentEventEntity): Promise<PaymentEventEntity> {
		if (!entity.id) {
			return this.create(entity);
		}
		const updated = await this.core.updateById(
			entity.id,
			entity,
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
		if (!updated) {
			throw new Error(`Payment event not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<PaymentEventEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: PaymentEventGetByPaymentIdDto): Promise<PaymentEventEntity[]> {
		const { limit, sortOrder, cursor, paymentId } = filter;
		const mongoFilter: FilterQuery = { payment_id: paymentId };

		if (cursor) {
			mongoFilter._id = sortOrder === ESortOrder.ASC ? { $gt: cursor } : { $lt: cursor };
		}

		const scoped = this.core.buildScopedFilter(mongoFilter, undefined);
		let mongoQuery = this.core.getModel().find(scoped);
		if (limit) {
			mongoQuery = mongoQuery.limit(limit);
		}
		mongoQuery = mongoQuery.sort({ _id: sortOrder === ESortOrder.ASC ? 1 : -1 });
		if (this.session) {
			mongoQuery = mongoQuery.session(this.session);
		}
		const docs = await mongoQuery.exec();
		return docs.map((doc) => this.mapToEntity(doc as unknown as PaymentEventDocument));
	}

	async findByIds(ids: string[]): Promise<PaymentEventEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async findByPaymentId(filter: PaymentEventGetByPaymentIdDto): Promise<PaymentEventEntity[]> {
		return this.findMany(filter);
	}

	private mapToEntity(doc: PaymentEventDocument): PaymentEventEntity {
		return PaymentEventEntity.instantiate(
			documentIdString(doc)!,
			{
				paymentId: doc.payment_id,
				paymentAttemptId: doc.payment_attempt_id || null,
				eventType: doc.event_type,
				triggerType: doc.trigger_type as TriggerType,
				triggeredBy: doc.triggered_by,
				fieldChanges: doc.field_changes || {},
				occurredAt: doc.occurred_at,
			}
		);
	}

	private mapToPersistence(data: Partial<PaymentEventEntity>): Record<string, unknown> {
		if (!(data instanceof PaymentEventEntity)) {
			throw new Error('Audit repository expects PaymentEventEntity instance');
		}
		return {
			payment_id: data.paymentId,
			payment_attempt_id: data.paymentAttemptId ?? null,
			event_type: data.eventType,
			trigger_type: data.triggerType,
			triggered_by: data.triggeredBy,
			field_changes: data.fieldChanges,
			occurred_at: data.occurredAt,
		};
	}
}
