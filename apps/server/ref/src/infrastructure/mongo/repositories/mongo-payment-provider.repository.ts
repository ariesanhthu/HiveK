import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { PaymentProviderEntity } from '@/core';
import { IPaymentProviderRepository } from '@/core';
import { PaymentProviderDocument, PaymentProviderModel } from '../schemas';
import { ESortOrder } from '@/shared/enums';
import { PaymentProviderGetListDto } from '@/application/queries';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { PAYMENT_SOFT_DELETE_ONLY_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoPaymentProviderRepository implements IPaymentProviderRepository {
	private readonly core: SgodMongooseRepositoryCore<PaymentProviderEntity>;

	constructor(
		@InjectModel(PaymentProviderModel.name)
		providerModel: Model<PaymentProviderDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(providerModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<PaymentProviderDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_SOFT_DELETE_ONLY_FILTER_CONFIG
		);
	}

	async create(entity: PaymentProviderEntity): Promise<PaymentProviderEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: PaymentProviderEntity): Promise<PaymentProviderEntity> {
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
			throw new Error(`Payment provider not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<PaymentProviderEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: PaymentProviderGetListDto): Promise<PaymentProviderEntity[]> {
		const { limit, sortOrder, cursor, ...query } = filter;
		const mongoFilter: FilterQuery = {};

		if (query.methods) {
			mongoFilter.supported_methods = { $in: query.methods };
		}
		if (query.isActive) {
			mongoFilter.is_active = query.isActive;
		}
		if (cursor) {
			mongoFilter._id = sortOrder === ESortOrder.ASC ? { $gt: cursor } : { $lt: cursor };
		}

		// const scoped = this.core.buildScopedFilter(mongoFilter, undefined);
		// console.log(scoped)
		let mongoQuery = this.core.getModel().find(mongoFilter);
		if (limit) {
			mongoQuery = mongoQuery.limit(limit);
		}
		mongoQuery = mongoQuery.sort({ _id: sortOrder === ESortOrder.ASC ? 1 : -1 });
		if (this.session) {
			mongoQuery = mongoQuery.session(this.session);
		}
		const docs = await mongoQuery.exec();
		return docs.map((doc) => this.mapToEntity(doc as unknown as PaymentProviderDocument));
	}

	async findByIds(ids: string[]): Promise<PaymentProviderEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async findByCode(code: string): Promise<PaymentProviderEntity | null> {
		return this.core.findOneScoped(
			{ code },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async findAllActive(): Promise<PaymentProviderEntity[]> {
		return this.core.findMany({ is_active: true }, undefined, findManyOptions(this.session));
	}

	private mapToEntity(doc: PaymentProviderDocument): PaymentProviderEntity {
		return PaymentProviderEntity.instantiate(
			documentIdString(doc)!,
			{
				code: doc.code,
				displayName: doc.display_name,
				supportedMethods: doc.supported_methods,
				supportedCurrencies: doc.supported_currencies,
				credentials: doc.credentials,
				isActive: doc.is_active,
				supportsWebhook: doc.supports_webhook,
				supportsRefund: doc.supports_refund,
				supportsPartialRefund: doc.supports_partial_refund,
				baseUrl: doc.base_url,
				testUrl: doc.test_url,
				webhookUrl: doc.webhook_url,
				createdAt: doc.created_at,
				updatedAt: doc.updated_at,
				deletedAt: doc.deleted_at || undefined,
				deletedBy: doc.deleted_by || undefined,
			}
		);
	}

	private mapToPersistence(data: Partial<PaymentProviderEntity>): Record<string, unknown> {
		if (!(data instanceof PaymentProviderEntity)) {
			throw new Error('Payment provider repository expects PaymentProviderEntity instance');
		}
		return {
			code: data.code,
			display_name: data.displayName,
			supported_methods: data.supportedMethods,
			supported_currencies: data.supportedCurrencies,
			credentials: data.credentials,
			is_active: data.isActive,
			supports_webhook: data.supportsWebhook,
			supports_refund: data.supportsRefund,
			supports_partial_refund: data.supportsPartialRefund,
			base_url: data.baseUrl,
			test_url: data.testUrl,
			webhook_url: data.webhookUrl,
			created_at: data.createdAt,
			updated_at: data.updatedAt,
			deleted_at: data.deletedAt ?? null,
			deleted_by: data.deletedBy ?? null,
		};
	}
}
