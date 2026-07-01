import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { OutboxEntity, EOutboxStatus } from '@/core';
import { type IOutboxRepository } from '@/core';
import { type OutboxEventDocument, OutboxEventModel } from '../schemas';
import { getDocDate } from '@/infrastructure/mongo/utils/document-timestamps';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import type { UnknownRecord } from '@/shared/types';
import { PAYMENT_UNSCOPED_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoOutboxRepository implements IOutboxRepository {
	private readonly core: SgodMongooseRepositoryCore<OutboxEntity>;

	constructor(
		@InjectModel(OutboxEventModel.name)
		outboxModel: Model<OutboxEventDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(outboxModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<OutboxEventDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_UNSCOPED_FILTER_CONFIG
		);
	}

	async create(entity: OutboxEntity): Promise<OutboxEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: OutboxEntity): Promise<OutboxEntity> {
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
			throw new Error(`Outbox event not found to update: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<OutboxEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: UnknownRecord): Promise<OutboxEntity[]> {
		return this.core.findMany(filter, undefined, findManyOptions(this.session));
	}

	async findByIds(ids: string[]): Promise<OutboxEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async findPending(limit: number): Promise<OutboxEntity[]> {
		const scoped = this.core.buildScopedFilter({ status: { $in: ['PENDING', 'pending'] } }, undefined);
		let mongoQuery = this.core.getModel().find(scoped).sort({ created_at: 1 }).limit(limit);
		if (this.session) {
			mongoQuery = mongoQuery.session(this.session);
		}
		const docs = await mongoQuery.exec();
		return docs.map((doc) => this.mapToEntity(doc as unknown as OutboxEventDocument));
	}

	private mapToEntity(doc: OutboxEventDocument): OutboxEntity {
		// Map Mongoose schema status (uppercase) to Domain OutboxEntity status (lowercase enum)
		let status = EOutboxStatus.PENDING;
		const docStatus = (doc.status || '').toLowerCase();
		if (docStatus === 'processed' || docStatus === 'done') {
			status = EOutboxStatus.DONE;
		} else if (docStatus === 'processing') {
			status = EOutboxStatus.PROCESSING;
		} else if (docStatus === 'failed') {
			status = EOutboxStatus.FAILED;
		}

		return OutboxEntity.instantiate(
			documentIdString(doc)!,
			{
				eventType: doc.event_type,
				payload: doc.payload,
				status,
				retryCount: doc.attempts || 0,
				maxRetry: 5, // Default maxRetry in example
				errorReason: doc.last_error || null,
				metadata: doc.metadata ?? null,
				transport: doc.transport ?? null,
				createdAt: getDocDate(doc, 'created_at'),
				processedAt: doc.processed_at || null,
			}
		);
	}

	private mapToPersistence(data: Partial<OutboxEntity>): Record<string, unknown> {
		if (!(data instanceof OutboxEntity)) {
			throw new Error('Outbox repository expects OutboxEntity instance');
		}

		// Map Domain status (lowercase enum) back to Mongoose uppercase status
		let dbStatus = 'PENDING';
		if (data.status === EOutboxStatus.DONE) {
			dbStatus = 'PROCESSED';
		} else if (data.status === EOutboxStatus.FAILED) {
			dbStatus = 'FAILED';
		} else if (data.status === EOutboxStatus.PROCESSING) {
			dbStatus = 'PROCESSING';
		}

		return {
			event_type: data.eventType,
			payload: data.payload,
			status: dbStatus,
			attempts: data.retryCount,
			last_error: data.errorReason,
			created_at: data.createdAt,
			processed_at: data.processedAt,
			metadata: data.metadata,
			transport: data.transport,
		};
	}
}
