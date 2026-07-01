import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { SubscriptionHistoryEntity } from '@/core';
import { ISubscriptionHistoryRepository } from '@/core';
import { SubscriptionHistoryDocument, SubscriptionHistoryModel } from '../schemas';
import { SubscriptionChangeDetailsVO } from '@/core';
import { ESortOrder } from '@/shared/enums';
import { getDocDate } from '@/infrastructure/mongo/utils/document-timestamps';
import { subscriptionChangeDetailsPropsFromMongo } from '@/infrastructure/mongo/utils/subscription-change-details-from-document';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { SubscriptionGetListHistoryDto } from '@/application/queries';
import { PAYMENT_TENANT_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoSubscriptionHistoryRepository implements ISubscriptionHistoryRepository {
	private readonly core: SgodMongooseRepositoryCore<SubscriptionHistoryEntity>;

	constructor(
		@InjectModel(SubscriptionHistoryModel.name)
		subscriptionHistoryModel: Model<SubscriptionHistoryDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(subscriptionHistoryModel),
			{
				toDomain: (doc) =>
					this.mapToEntity(asMongooseDoc<SubscriptionHistoryDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_TENANT_FILTER_CONFIG
		);
	}

	async create(entity: SubscriptionHistoryEntity): Promise<SubscriptionHistoryEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: SubscriptionHistoryEntity): Promise<SubscriptionHistoryEntity> {
		if (!entity.id) {
			return this.create(entity);
		}
		const updated = await this.core.updateById(
			entity.id,
			entity,
			{ tenantId: entity.enterpriseId },
			sgodWriteOptionsFromSession(this.session)
		);
		if (!updated) {
			throw new Error(`Subscription history not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<SubscriptionHistoryEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: SubscriptionGetListHistoryDto): Promise<SubscriptionHistoryEntity[]> {
		const { limit, sortOrder, cursor, enterpriseId } = filter;
		const query: FilterQuery = {};

		if (cursor) {
			query._id = sortOrder === ESortOrder.ASC ? { $gt: cursor } : { $lt: cursor };
		}

		const scope = enterpriseId ? { tenantId: enterpriseId } : undefined;
		const scoped = this.core.buildScopedFilter(query, scope);
		let mongoQuery = this.core.getModel().find(scoped);
		if (limit) {
			mongoQuery = mongoQuery.limit(limit);
		}
		mongoQuery = mongoQuery.sort({ _id: sortOrder === ESortOrder.ASC ? 1 : -1 });
		if (this.session) {
			mongoQuery = mongoQuery.session(this.session);
		}
		const docs = await mongoQuery.exec();
		return docs.map((doc) => this.mapToEntity(doc as unknown as SubscriptionHistoryDocument));
	}

	async findByIds(ids: string[]): Promise<SubscriptionHistoryEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async findBySubscriptionId(subscriptionId: string): Promise<SubscriptionHistoryEntity[]> {
		return this.core.findMany(
			{ subscription_id: subscriptionId },
			undefined,
			findManyOptions(this.session)
		);
	}

	async findByEnterpriseId(enterpriseId: string): Promise<SubscriptionHistoryEntity[]> {
		return this.core.findMany({}, { tenantId: enterpriseId }, findManyOptions(this.session));
	}

	private mapToEntity(doc: SubscriptionHistoryDocument): SubscriptionHistoryEntity {
		return SubscriptionHistoryEntity.instantiate(
			documentIdString(doc)!,
			{
				enterpriseId: doc.enterprise_id,
				subscriptionId: doc.subscription_id,
				billId: doc.bill_id,
				actorId: doc.actor_id,
				details: new SubscriptionChangeDetailsVO(
					subscriptionChangeDetailsPropsFromMongo(doc.details)
				),
				createdAt: getDocDate(doc, 'created_at'),
			}
		);
	}

	private mapToPersistence(data: Partial<SubscriptionHistoryEntity>): Record<string, unknown> {
		if (!(data instanceof SubscriptionHistoryEntity)) {
			throw new Error(
				'Subscription history repository expects SubscriptionHistoryEntity instance'
			);
		}
		return {
			enterprise_id: data.enterpriseId,
			subscription_id: data.subscriptionId,
			bill_id: data.billId,
			actor_id: data.actorId,
			details: {
				oldPackages: data.details.oldPackages,
				newPackages: data.details.newPackages,
				oldQuotas: data.details.oldQuotas.unmarshal,
				newQuotas: data.details.newQuotas.unmarshal,
				oldPermissions: data.details.oldPermissions,
				newPermissions: data.details.newPermissions,
			},
		};
	}
}
