import { PaymentEntity } from '@/core/aggregate-roots';
import {
  PaymentAttemptEntity,
  PaymentTransactionEntity,
} from '@/core/entities';
import {
  PaymentAttemptResponseDto,
  PaymentDetailResponseDto,
  PaymentResponseDto,
  PaymentTransactionResponseDto,
} from '../dtos';
import type {
  EPaymentStatus,
  EPaymentAttemptStatus,
  ETransactionStatus,
} from '@/core/enums';

export class PaymentMapper {
  static toDto(entity: PaymentEntity): PaymentResponseDto {
    return {
      id: entity.id,
      enterpriseId: entity.enterpriseId,
      userId: entity.userId || null,
      billId: entity.billId,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status.value,
      description: entity.description || undefined,
      idempotencyKey: entity.idempotencyKey || undefined,
      version: entity.version,
      expiresAt: entity.expiresAt?.toISOString() || undefined,
      canceledAt: entity.canceledAt?.toISOString() || undefined,
      canceledBy: entity.canceledBy || undefined,
      cancelReason: entity.cancelReason || undefined,
      metadata: entity.metadata || {},
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      deletedAt: entity.deletedAt?.toISOString() || null,
      deletedBy: entity.deletedBy || undefined,
    };
  }

  static toDtoDetail(entity: PaymentEntity): PaymentDetailResponseDto {
    return {
      id: entity.id,
      enterpriseId: entity.enterpriseId,
      userId: entity.userId || null,
      billId: entity.billId,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status.value,
      description: entity.description || undefined,
      attempts: entity.paymentAttempts.map((attempt) =>
        this.toDtoAttempt(attempt),
      ),
      idempotencyKey: entity.idempotencyKey || undefined,
      version: entity.version,
      expiresAt: entity.expiresAt?.toISOString() || undefined,
      canceledAt: entity.canceledAt?.toISOString() || undefined,
      canceledBy: entity.canceledBy || undefined,
      cancelReason: entity.cancelReason || undefined,
      metadata: entity.metadata || {},
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      deletedAt: entity.deletedAt?.toISOString() || null,
      deletedBy: entity.deletedBy || undefined,
    };
  }

  static toDtoAttempt(entity: PaymentAttemptEntity): PaymentAttemptResponseDto {
    return {
      paymentProviderId: entity.paymentProviderId,
      attemptNumber: entity.attemptNumber,
      status: entity.status.value,
      transactions: entity.transactions.map((transaction) =>
        this.toDtoTransaction(transaction),
      ),
      failureReason: entity.failureReason,
      failureType: entity.failureType?.type,
      totalRefundedAmount: entity.totalRefundedAmount?.amount || undefined,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toDtoTransaction(
    entity: PaymentTransactionEntity,
  ): PaymentTransactionResponseDto {
    return {
      transactionType: entity.transactionType,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      description: entity.description || undefined,
      providerTransactionId: entity.providerTransactionId || undefined,
      metadata: entity.metadata || {},
      providerRequest: entity.providerRequest,
      providerResponse: entity.providerResponse,
      providerRequestHeaders: entity.providerRequestHeaders,
      providerResponseHeaders: entity.providerResponseHeaders,
      providerRequestTimestamp: entity.providerRequestTimestamp?.toISOString(),
      providerResponseTimestamp:
        entity.providerResponseTimestamp?.toISOString(),
    };
  }

  static toDtoList(entities: PaymentEntity[]): PaymentResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
