import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { WalletEntity } from '@/core';
import { IWalletRepository } from '@/core';
import { WalletDocument, WalletModel } from '../schemas';
import { MoneyVO } from '@/core';
import { getDocDate } from '@/infrastructure/mongo/utils/document-timestamps';
import type { UnknownRecord } from '@/shared/types';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { PAYMENT_TENANT_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { invariant } from '../utils/repository-invariants.util';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoWalletRepository implements IWalletRepository {
	private readonly core: SgodMongooseRepositoryCore<WalletEntity>;

	constructor(
		@InjectModel(WalletModel.name)
		walletModel: Model<WalletDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(walletModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<WalletDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_TENANT_FILTER_CONFIG
		);
	}

	async create(entity: WalletEntity): Promise<WalletEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: WalletEntity): Promise<WalletEntity> {
		if (!entity.id) {
			return this.create(entity);
		}
		const updated = await this.core.updateById(
			entity.id,
			entity,
			{ tenantId: entity.enterpriseId },
			sgodWriteOptionsFromSession(this.session)
		);
		invariant(updated !== null, `Wallet not found: ${entity.id}`);
		return updated;
	}

	async findById(id: string): Promise<WalletEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: UnknownRecord): Promise<WalletEntity[]> {
		return this.core.findMany(filter, undefined, findManyOptions(this.session));
	}

	async findByIds(ids: string[]): Promise<WalletEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async findByEnterpriseId(enterpriseId: string): Promise<WalletEntity | null> {
		return this.core.findOneScoped(
			{ enterprise_id: enterpriseId },
			{ tenantId: enterpriseId },
			sgodWriteOptionsFromSession(this.session)
		);
	}

	private mapToEntity(doc: WalletDocument): WalletEntity {
		return WalletEntity.instantiate(
			documentIdString(doc)!,
			{
				enterpriseId: doc.enterprise_id,
				balance: new MoneyVO(doc.balance_amount, doc.balance_currency),
				createdAt: getDocDate(doc, 'created_at'),
				updatedAt: getDocDate(doc, 'updated_at'),
			}
		);
	}

	private mapToPersistence(data: Partial<WalletEntity>): Record<string, unknown> {
		invariant(data instanceof WalletEntity, 'Wallet repository expects WalletEntity instance');
		return {
			enterprise_id: data.enterpriseId,
			balance_amount: data.balance.amount,
			balance_currency: data.balance.currency,
		};
	}
}
