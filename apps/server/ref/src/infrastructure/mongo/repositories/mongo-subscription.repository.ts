import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { SubscriptionEntity } from '@/core';
import { SubscriptionItemVO } from '@/core';
import { ISubscriptionRepository } from '@/core';
import { SubscriptionDocument, SubscriptionModel } from '../schemas';
import { QuotaVO } from '@/core';
import { SubscriptionGetListDto } from '@/application/queries/subscription-get-list';
import { ESortOrder } from '@/shared/enums';
import { getDocDate } from '@/infrastructure/mongo/utils/document-timestamps';
import { quotaPropsFromUnknown } from '@/infrastructure/mongo/utils/quota-from-document';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { PAYMENT_TENANT_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoSubscriptionRepository implements ISubscriptionRepository {
	private readonly core: SgodMongooseRepositoryCore<SubscriptionEntity>;

	constructor(
		@InjectModel(SubscriptionModel.name)
		subscriptionModel: Model<SubscriptionDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(subscriptionModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<SubscriptionDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_TENANT_FILTER_CONFIG
		);
	}

	async create(entity: SubscriptionEntity): Promise<SubscriptionEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: SubscriptionEntity): Promise<SubscriptionEntity> {
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
			throw new Error(`Subscription not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<SubscriptionEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: SubscriptionGetListDto): Promise<SubscriptionEntity[]> {
		const { limit, sortOrder, cursor, enterpriseId, status } = filter;
		const query: FilterQuery = {};

		if (status) {
			query.status = status;
		}
		if (cursor) {
			query._id = sortOrder === ESortOrder.ASC ? { $gt: cursor } : { $lt: cursor };
		}

		const scoped = this.core.buildScopedFilter(
			query,
			enterpriseId ? { tenantId: enterpriseId } : undefined
		);
		let mongoQuery = this.core.getModel().find(scoped);
		if (limit) {
			mongoQuery = mongoQuery.limit(limit);
		}
		mongoQuery = mongoQuery.sort({ _id: sortOrder === ESortOrder.ASC ? 1 : -1 });
		if (this.session) {
			mongoQuery = mongoQuery.session(this.session);
		}
		const docs = await mongoQuery.exec();
		return docs.map((doc) => this.mapToEntity(doc as unknown as SubscriptionDocument));
	}

	async findByIds(ids: string[]): Promise<SubscriptionEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async findByEnterpriseId(enterpriseId: string): Promise<SubscriptionEntity | null> {
		return this.core.findOneScoped(
			{ enterprise_id: enterpriseId },
			{ tenantId: enterpriseId },
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async existsByPackageId(packageId: string): Promise<boolean> {
		return this.core.exists(
			{ 'items.package_id': packageId },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async updateWithVersion(
		id: string,
		expectedVersion: number,
		entity: SubscriptionEntity
	): Promise<void> {
		const plain = this.mapToPersistence(entity);
		delete plain.version;

		const result = await this.core
			.getModel()
			.updateOne(
				{ _id: id, version: expectedVersion },
				{ $set: plain, $inc: { version: 1 } },
				this.session !== undefined ? { session: this.session } : {}
			);

		if (result.modifiedCount === 0) {
			throw new Error('OptimisticLockException: Subscription version conflict');
		}
	}

	private mapToEntity(doc: SubscriptionDocument): SubscriptionEntity {
		return SubscriptionEntity.instantiate(
			documentIdString(doc)!,
			{
				enterpriseId: doc.enterprise_id,
				status: doc.status,
				items: (doc.items || []).map(
					(item) =>
						new SubscriptionItemVO({
							packageId: item.package_id,
							packageVariantId: item.package_variant_id,
							startDate: item.start_date,
							expiresAt: item.expires_at,
							billId: item.bill_id,
						})
				),
				computedQuotas: new QuotaVO(quotaPropsFromUnknown(doc.computed_quotas)),
				computedPermissions: doc.computed_permissions || [],
				version: doc.version || 1,
				nextExpiryCheckAt: doc.next_expiry_check_at,
				createdAt: getDocDate(doc, 'created_at'),
				updatedAt: getDocDate(doc, 'updated_at'),
			}
		);
	}

	private mapToPersistence(data: Partial<SubscriptionEntity>): Record<string, unknown> {
		if (!(data instanceof SubscriptionEntity)) {
			throw new Error('Subscription repository expects SubscriptionEntity instance');
		}
		return {
			enterprise_id: data.enterpriseId,
			status: data.status,
			items: data.items.map((item) => ({
				package_id: item.packageId,
				package_variant_id: item.packageVariantId,
				start_date: item.startDate,
				expires_at: item.expiresAt,
				bill_id: item.billId,
			})),
			computed_quotas: data.computedQuotas.unmarshal,
			computed_permissions: data.computedPermissions,
			version: data.version,
			next_expiry_check_at: data.nextExpiryCheckAt,
		};
	}
}
