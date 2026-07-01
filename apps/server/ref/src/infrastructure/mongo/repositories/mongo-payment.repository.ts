import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	SgodMongooseRepositoryCore,
	sgodWriteOptionsFromSession,
	type FilterQuery,
} from '@sgod-mongodb/library/mongoose';
import { type ClientSession, Model } from 'mongoose';
import { PaymentEntity, PaymentAttemptEntity, PaymentTransactionEntity } from '@/core';
import { IPaymentRepository } from '@/core';
import { MoneyVO, PaymentStatusVO, PaymentAttemptStatusVO, FailureTypeVO } from '@/core';
import { PaymentDocument, PaymentModel } from '../schemas';
import { PaymentGetListDto } from '@/application/queries';
import { ESortOrder } from '@/shared/enums';
import { documentIdString } from '@/shared/utils/mongo-id.util';
import { EPaymentStatus } from '@/core';
import { PAYMENT_SOFT_DELETE_FILTER_CONFIG } from '../constants/payment-mongo.constants';
import { asMongooseDoc, asSgodModel, findManyOptions } from '../utils/repository-session.util';

const ACTIVE_PAYMENT_STATUSES = [
	EPaymentStatus.PENDING,
	EPaymentStatus.PROCESSING,
	EPaymentStatus.PENDING_PAYMENT_PROVIDER,
] as const;

@Injectable()
export class MongoPaymentRepository implements IPaymentRepository {
	private readonly core: SgodMongooseRepositoryCore<PaymentEntity>;

	constructor(
		@InjectModel(PaymentModel.name)
		paymentModel: Model<PaymentDocument>,
		@Optional() private readonly session?: ClientSession
	) {
		this.core = new SgodMongooseRepositoryCore(
			asSgodModel(paymentModel),
			{
				toDomain: (doc) => this.mapToEntity(asMongooseDoc<PaymentDocument>(doc)),
				toPersistence: (data) => this.mapToPersistence(data),
			},
			PAYMENT_SOFT_DELETE_FILTER_CONFIG
		);
	}

	async create(entity: PaymentEntity): Promise<PaymentEntity> {
		return this.core.insertOne(entity, this.session);
	}

	async save(entity: PaymentEntity): Promise<PaymentEntity> {
		if (!entity.id) {
			return this.create(entity);
		}
		const updated = await this.core.updateById(
			entity.id,
			entity,
			{ tenantId: entity.enterpriseId, includeDeleted: true },
			sgodWriteOptionsFromSession(this.session)
		);
		if (!updated) {
			throw new Error(`Payment not found: ${entity.id}`);
		}
		return updated;
	}

	async findById(id: string): Promise<PaymentEntity | null> {
		return this.core.findById(id, sgodWriteOptionsFromSession(this.session));
	}

	async findActiveByBillId(billId: string): Promise<PaymentEntity | null> {
		return this.core.findOneScoped(
			{ bill_id: billId, status: { $in: [...ACTIVE_PAYMENT_STATUSES] } },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async findAllByBillId(billId: string): Promise<PaymentEntity[]> {
		return this.core.findMany({ bill_id: billId }, undefined, findManyOptions(this.session));
	}

	async hasActivePaymentForBill(billId: string): Promise<boolean> {
		return this.core.exists(
			{ bill_id: billId, status: { $in: [...ACTIVE_PAYMENT_STATUSES] } },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async findByIdempotencyKey(key: string): Promise<PaymentEntity | null> {
		return this.core.findOneScoped(
			{ idempotency_key: key },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async findByUserId(userId: string): Promise<PaymentEntity[]> {
		return this.core.findMany({ user_id: userId }, undefined, findManyOptions(this.session));
	}

	async findByAttemptId(attemptId: string): Promise<PaymentEntity | null> {
		return this.core.findOneScoped(
			{ 'payment_attempts._id': attemptId },
			undefined,
			sgodWriteOptionsFromSession(this.session)
		);
	}

	async delete(id: string): Promise<void> {
		await this.core.hardDeleteById(id, { session: this.session });
	}

	async findMany(filter: PaymentGetListDto): Promise<PaymentEntity[]> {
		const { limit, sortOrder, cursor, startDate, endDate, enterpriseId } = filter;
		const query: FilterQuery = {};

		if (startDate || endDate) {
			const range: { $gte?: Date; $lte?: Date } = {};
			if (startDate) range.$gte = startDate;
			if (endDate) range.$lte = endDate;
			query.created_at = range;
		}
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
		return docs.map((doc) => this.mapToEntity(doc as unknown as PaymentDocument));
	}

	async findByIds(ids: string[]): Promise<PaymentEntity[]> {
		return this.core.findMany({ _id: { $in: ids } }, undefined, findManyOptions(this.session));
	}

	async exists(id: string): Promise<boolean> {
		return this.core.exists({ _id: id }, undefined, sgodWriteOptionsFromSession(this.session));
	}

	private mapToEntity(doc: PaymentDocument): PaymentEntity {
		return PaymentEntity.instantiate(
			documentIdString(doc)!,
			{
				enterpriseId: doc.enterprise_id,
				userId: doc.user_id ?? null,
				billId: doc.bill_id,
				amount: new MoneyVO(doc.amount, doc.currency),
				status: new PaymentStatusVO(doc.status),
				description: doc.description,
				idempotencyKey: doc.idempotency_key,
				version: doc.version,
				expiresAt: doc.expires_at,
				canceledAt: doc.canceled_at,
				canceledBy: doc.canceled_by,
				cancelReason: doc.cancel_reason,
				metadata: doc.metadata,
				paymentAttempts: doc.payment_attempts.map(
					(attempt) =>
						PaymentAttemptEntity.instantiate(
							attempt.id?.toString()!,
							{
								paymentProviderId: attempt.payment_provider_id,
								idempotencyKey: attempt.idempotency_key,
								paymentUrl: attempt.payment_url,
								attemptNumber: attempt.attempt_number,
								status: new PaymentAttemptStatusVO(attempt.status),
								providerTransactionId: attempt.provider_transaction_id,
								failureReason: attempt.failure_reason,
								failureType: attempt.failure_type
									? FailureTypeVO.fromType(attempt.failure_type)
									: undefined,
								totalRefundedAmount: attempt.total_refunded_amount
									? new MoneyVO(attempt.total_refunded_amount, doc.currency)
									: undefined,
								transactions: attempt.transactions.map(
									(tx) =>
										PaymentTransactionEntity.instantiate(
											tx.id?.toString()!,
											{
												transactionType: tx.transaction_type,
												transactionSource: tx.transaction_source,
												amount: new MoneyVO(tx.amount, tx.currency),
												status: tx.status,
												description: tx.description,
												providerTransactionId: tx.provider_transaction_id,
												providerRequest: tx.provider_request,
												providerRequestHeaders: tx.provider_request_headers,
												providerRequestTimestamp:
													tx.provider_request_timestamp,
												providerResponse: tx.provider_response,
												providerResponseHeaders:
													tx.provider_response_headers,
												providerResponseTimestamp:
													tx.provider_response_timestamp,
												metadata: tx.metadata,
												createdAt: tx.created_at,
											}
										)
								),
								createdAt: attempt.created_at,
								updatedAt: attempt.updated_at,
							}
						)
				),
				createdAt: doc.created_at,
				updatedAt: doc.updated_at,
				deletedAt: doc.deleted_at ?? undefined,
				deletedBy: doc.deleted_by,
			}
		);
	}

	private mapToPersistence(data: Partial<PaymentEntity>): Record<string, unknown> {
		if (!(data instanceof PaymentEntity)) {
			throw new Error('Payment repository expects PaymentEntity instance');
		}
		const includeNestedIds = Boolean(data.id);
		return {
			enterprise_id: data.enterpriseId,
			user_id: data.userId ?? null,
			bill_id: data.billId,
			amount: data.amount.amount,
			currency: data.amount.currency,
			status: data.status.value,
			description: data.description,
			idempotency_key: data.idempotencyKey,
			version: data.version,
			expires_at: data.expiresAt,
			canceled_at: data.canceledAt,
			canceled_by: data.canceledBy,
			cancel_reason: data.cancelReason,
			metadata: data.metadata,
			payment_attempts: data.paymentAttempts.map((attempt) => ({
				...(includeNestedIds && attempt.id ? { _id: attempt.id } : {}),
				payment_provider_id: attempt.paymentProviderId,
				idempotency_key: attempt.idempotencyKey,
				payment_url: attempt.paymentUrl,
				attempt_number: attempt.attemptNumber,
				status: attempt.status.value,
				provider_transaction_id: attempt.providerTransactionId,
				failure_reason: attempt.failureReason,
				failure_type: attempt.failureType?.type,
				total_refunded_amount: attempt.totalRefundedAmount?.amount,
				transactions: attempt.transactions.map((tx) => ({
					...(includeNestedIds && tx.id ? { _id: tx.id } : {}),
					transaction_type: tx.transactionType,
					transaction_source: tx.transactionSource,
					amount: tx.amount.amount,
					currency: tx.amount.currency,
					status: tx.status,
					description: tx.description,
					provider_transaction_id: tx.providerTransactionId,
					provider_request: tx.providerRequest,
					provider_request_headers: tx.providerRequestHeaders,
					provider_request_timestamp: tx.providerRequestTimestamp,
					provider_response: tx.providerResponse,
					provider_response_headers: tx.providerResponseHeaders,
					provider_response_timestamp: tx.providerResponseTimestamp,
					metadata: tx.metadata ?? undefined,
					created_at: tx.createdAt,
				})),
				created_at: attempt.createdAt,
				updated_at: attempt.updatedAt,
			})),
			created_at: data.createdAt,
			updated_at: data.updatedAt,
			deleted_at: data.deletedAt ?? null,
			deleted_by: data.deletedBy,
		};
	}
}
