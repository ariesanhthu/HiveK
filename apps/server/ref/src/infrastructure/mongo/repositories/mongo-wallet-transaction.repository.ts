import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { WalletTransactionEntity } from '@/core';
import { IWalletTransactionRepository } from '@/core';
import { WalletTransactionDocument, WalletTransactionModel } from '../schemas';
import { MoneyVO } from '@/core';
import { ESortOrder } from '@/shared/enums';
import { getDocDate } from '@/infrastructure/mongo/utils/document-timestamps';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { WalletGetListTransactionDto } from '@/application/queries';
import { PAYMENT_TENANT_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoWalletTransactionRepository implements IWalletTransactionRepository {
	private readonly core: SgodMongooseRepositoryCore<WalletTransactionEntity>;

	constructor(
		@InjectModel(WalletTransactionModel.name)
		walletTransactionModel: Model<WalletTransactionDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(walletTransactionModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<WalletTransactionDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_TENANT_FILTER_CONFIG
		);
	}

	async create(entity: WalletTransactionEntity): Promise<WalletTransactionEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: WalletTransactionEntity): Promise<WalletTransactionEntity> {
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
			throw new Error(`Wallet transaction not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<WalletTransactionEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: WalletGetListTransactionDto): Promise<WalletTransactionEntity[]> {
		const { limit, sortOrder, cursor } = filter;
		const query: FilterQuery = {};

		if (cursor) {
			query._id = sortOrder === ESortOrder.ASC ? { $gt: cursor } : { $lt: cursor };
		}

		let mongoQuery = this.core.getModel().find(query);
		if (limit) {
			mongoQuery = mongoQuery.limit(limit);
		}
		mongoQuery = mongoQuery.sort({ _id: sortOrder === ESortOrder.ASC ? 1 : -1 });
		if (this.session) {
			mongoQuery = mongoQuery.session(this.session);
		}
		const docs = await mongoQuery.exec();
		return docs.map((doc) => this.mapToEntity(doc as unknown as WalletTransactionDocument));
	}

	async findByIds(ids: string[]): Promise<WalletTransactionEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async findByWalletId(walletId: string): Promise<WalletTransactionEntity[]> {
		return this.core.findMany(
			{ wallet_id: walletId },
			undefined,
			findManyOptions(this.session)
		);
	}

	async findByBillId(billId: string): Promise<WalletTransactionEntity[]> {
		return this.core.findMany({ bill_id: billId }, undefined, findManyOptions(this.session));
	}

	async findByIdempotencyKey(idempotencyKey: string): Promise<WalletTransactionEntity | null> {
		return this.core.findOneScoped(
			{ idempotency_key: idempotencyKey },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	private mapToEntity(doc: WalletTransactionDocument): WalletTransactionEntity {
		return WalletTransactionEntity.instantiate(
			documentIdString(doc)!,
			{
				walletId: doc.wallet_id,
				type: doc.type,
				amount: new MoneyVO(doc.amount, doc.currency),
				billId: doc.bill_id,
				idempotencyKey: doc.idempotency_key,
				description: doc.description || '',
				metadata: doc.metadata,
				createdAt: getDocDate(doc, 'created_at'),
			}
		);
	}

	private mapToPersistence(data: Partial<WalletTransactionEntity>): Record<string, unknown> {
		if (!(data instanceof WalletTransactionEntity)) {
			throw new Error(
				'Wallet transaction repository expects WalletTransactionEntity instance'
			);
		}
		return {
			wallet_id: data.walletId,
			type: data.type,
			amount: data.amount.amount,
			currency: data.amount.currency,
			bill_id: data.billId,
			idempotency_key: data.idempotencyKey,
			description: data.description,
			metadata: data.metadata,
		};
	}
}
