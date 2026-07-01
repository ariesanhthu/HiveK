import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { BillEntity } from '@/core';
import { IBillRepository } from '@/core';
import { BillDocument, BillModel } from '../schemas';
import { BillItemVO } from '@/core';
import { EBillStatus } from '@/core';
import { ESortOrder } from '@/shared/enums';
import { BillGetListDto } from '@/application/queries';
import { getDocDate } from '@/infrastructure/mongo/utils/document-timestamps';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { PAYMENT_TENANT_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

@Injectable()
export class MongoBillRepository implements IBillRepository {
	private readonly core: SgodMongooseRepositoryCore<BillEntity>;

	constructor(
		@InjectModel(BillModel.name)
		billModel: Model<BillDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(billModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<BillDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_TENANT_FILTER_CONFIG
		);
	}

	async create(entity: BillEntity): Promise<BillEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: BillEntity): Promise<BillEntity> {
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
			throw new Error(`Bill not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<BillEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(options: BillGetListDto): Promise<BillEntity[]> {
		const { limit, sortOrder, cursor, enterpriseId, status } = options;
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
		return docs.map((doc) => this.mapToEntity(doc as unknown as BillDocument));
	}

	async findByBillCode(billCode: string): Promise<BillEntity | null> {
		return this.core.findOneScoped(
			{ bill_code: billCode },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async findByEnterpriseId(enterpriseId: string): Promise<BillEntity[]> {
		return this.core.findMany(
			{ enterprise_id: enterpriseId },
			{ tenantId: enterpriseId },
			findManyOptions(this.session)
		);
	}

	async findByIds(ids: string[]): Promise<BillEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async findUnpaidBills(enterpriseId: string): Promise<BillEntity[]> {
		return this.core.findMany(
			{ status: EBillStatus.PENDING },
			{ tenantId: enterpriseId },
			findManyOptions(this.session)
		);
	}

	private mapToEntity(doc: BillDocument): BillEntity {
		return BillEntity.instantiate(
			documentIdString(doc)!,
			{
				billCode: doc.bill_code,
				enterpriseId: doc.enterprise_id,
				type: doc.type,
				status: doc.status,
				items: (doc.items || []).map(
					(item) =>
						new BillItemVO({
							packageId: item.package_id,
							packageVariantId: item.package_variant_id,
							price: item.price,
							taxPercent: item.tax_percent,
							creditRefundAmount: item.credit_refund_amount,
							purchaseType: item.purchase_type,
						})
				),
				totalAmount: doc.total_amount,
				creditAmountApplied: doc.credit_amount_applied,
				creditAmountRefund: doc.credit_amount_refund,
				taxAmount: doc.tax_amount,
				finalAmount: doc.final_amount,
				currency: doc.currency,
				expiresAt: doc.expires_at || null,
				createdAt: getDocDate(doc, 'created_at'),
			}
		);
	}

	private mapToPersistence(data: Partial<BillEntity>): Record<string, unknown> {
		if (!(data instanceof BillEntity)) {
			throw new Error('Bill repository expects BillEntity instance');
		}
		return {
			bill_code: data.billCode,
			enterprise_id: data.enterpriseId,
			type: data.type,
			status: data.status,
			items: data.items.map((item) => ({
				package_id: item.packageId,
				package_variant_id: item.packageVariantId,
				price: item.price,
				tax_percent: item.taxPercent,
				credit_refund_amount: item.creditRefundAmount,
				purchase_type: item.purchaseType,
			})),
			total_amount: data.totalAmount,
			credit_amount_applied: data.creditAmountApplied,
			credit_amount_refund: data.creditAmountRefund,
			tax_amount: data.taxAmount,
			final_amount: data.finalAmount,
			currency: data.currency,
			expires_at: data.expiresAt,
		};
	}
}
