import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IPaymentRepository } from '@/core/interfaces/repositories';
import { PaymentEntity } from '@/core/aggregate-roots';
import { PaymentAttemptEntity, PaymentTransactionEntity } from '@/core/entities';
import { MoneyVO, PaymentStatusVO, PaymentAttemptStatusVO, FailureTypeVO } from '@/core/value-objects';
import { PaymentModel, PaymentDocument } from '../schemas';
import { EPaymentStatus } from '@/core/enums';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

const ACTIVE_PAYMENT_STATUSES = [
  EPaymentStatus.PENDING,
  EPaymentStatus.PROCESSING,
  EPaymentStatus.PENDING_PAYMENT_PROVIDER,
];

@Injectable()
export class MongoPaymentRepository implements IPaymentRepository {
  constructor(
    @InjectModel(PaymentModel.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<PaymentEntity>> {
    const doc = await this.paymentModel.findOne({
      _id: id,
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(payment: PaymentEntity): Promise<void> {
    const data = this.mapToPersistence(payment);

    if (!payment.id) {
      const created = new this.paymentModel(data);
      const saved = await created.save({ session: this.session });
      payment.setId(saved._id.toString());
    } else {
      await this.paymentModel.findByIdAndUpdate(payment.id, data, { upsert: true }).session(this.session).exec();
    }

    await this.invalidateCache(payment.id!, payment.enterpriseId, payment.billId);
  }

  async saveMany(payments: PaymentEntity[]): Promise<void> {
    await Promise.all(payments.map(p => this.save(p)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.paymentModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.paymentModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.enterprise_id, doc.bill_id);
    }
  }

  private async invalidateCache(id: string, enterpriseId: string, billId: string): Promise<void> {
    const domain = 'payment';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.del(CacheKeyUtil.custom(domain, `billId:${billId}`)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (enterpriseId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `enterpriseId:${enterpriseId}`)));
    }
    await Promise.all(invalidations);
  }

  async findActiveByBillId(billId: string): Promise<Nullable<PaymentEntity>> {
    const doc = await this.paymentModel.findOne({
      bill_id: billId,
      status: { $in: ACTIVE_PAYMENT_STATUSES },
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findAllByBillId(billId: string): Promise<PaymentEntity[]> {
    const docs = await this.paymentModel.find({
      bill_id: billId,
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async hasActivePaymentForBill(billId: string): Promise<boolean> {
    const count = await this.paymentModel.countDocuments({
      bill_id: billId,
      status: { $in: ACTIVE_PAYMENT_STATUSES },
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    }).session(this.session).exec();
    return count > 0;
  }

  async findByIdempotencyKey(key: string): Promise<Nullable<PaymentEntity>> {
    const doc = await this.paymentModel.findOne({
      idempotency_key: key,
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<PaymentEntity[]> {
    const docs = await this.paymentModel.find({
      user_id: userId,
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByAttemptId(attemptId: string): Promise<Nullable<PaymentEntity>> {
    const doc = await this.paymentModel.findOne({
      'payment_attempts._id': new Types.ObjectId(attemptId),
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
    } as Record<string, unknown>).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  private mapToDomain(doc: PaymentDocument): PaymentEntity {
    return PaymentEntity.instantiate(
      doc._id.toString(),
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
          (attempt: PaymentDocument['payment_attempts'][0]) =>
            PaymentAttemptEntity.instantiate(
              attempt._id ? attempt._id.toString() : new Types.ObjectId().toString(),
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
                transactions: (attempt.transactions || []).map(
                  (tx: PaymentDocument['payment_attempts'][0]['transactions'][0]) =>
                    PaymentTransactionEntity.instantiate(
                      tx._id ? tx._id.toString() : new Types.ObjectId().toString(),
                      {
                        transactionType: tx.transaction_type,
                        transactionSource: tx.transaction_source,
                        amount: new MoneyVO(tx.amount, tx.currency),
                        status: tx.status,
                        description: tx.description,
                        providerTransactionId: tx.provider_transaction_id,
                        providerRequest: tx.provider_request,
                        providerRequestHeaders: tx.provider_request_headers,
                        providerRequestTimestamp: tx.provider_request_timestamp,
                        providerResponse: tx.provider_response,
                        providerResponseHeaders: tx.provider_response_headers,
                        providerResponseTimestamp: tx.provider_response_timestamp,
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
        createdAt: doc.get('created_at') || new Date(),
        updatedAt: doc.get('updated_at') || new Date(),
        deletedAt: doc.deleted_at ?? undefined,
        deletedBy: doc.deleted_by || undefined,
      }
    );
  }

  private mapToPersistence(data: PaymentEntity): Record<string, unknown> {
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
        ...(includeNestedIds && attempt.id ? { _id: new Types.ObjectId(attempt.id) } : {}),
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
          ...(includeNestedIds && tx.id ? { _id: new Types.ObjectId(tx.id) } : {}),
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
      deleted_at: data.deletedAt ?? null,
      deleted_by: data.deletedBy,
    };
  }
}
