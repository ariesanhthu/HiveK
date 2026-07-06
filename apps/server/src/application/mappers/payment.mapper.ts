import { PaymentEntity } from '@/core/aggregate-roots';
import { PaymentAttemptEntity, PaymentTransactionEntity } from '@/core/entities';
import {
  PaymentAttemptResponseDto,
  PaymentDetailResponseDto,
  PaymentResponseDto,
  PaymentTransactionResponseDto,
} from '../dtos';
import type { EPaymentStatus, EPaymentAttemptStatus, ETransactionStatus } from '@/core/enums';

export class PaymentMapper {
  static toDto(entity: PaymentEntity): PaymentResponseDto {
    return {
      id: entity.id!,
      enterpriseId: entity.enterpriseId,
      userId: entity.userId || null,
      billId: entity.billId,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status.value as EPaymentStatus,
      description: entity.description || undefined,
      idempotencyKey: entity.idempotencyKey || undefined,
      version: entity.version,
      expiresAt: entity.expiresAt || undefined,
      canceledAt: entity.canceledAt || undefined,
      canceledBy: entity.canceledBy || undefined,
      cancelReason: entity.cancelReason || undefined,
      metadata: entity.metadata || {},
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt || null,
      deletedBy: entity.deletedBy || undefined,
    };
  }

  static toDtoDetail(entity: PaymentEntity): PaymentDetailResponseDto {
    return {
      id: entity.id!,
      enterpriseId: entity.enterpriseId,
      userId: entity.userId || null,
      billId: entity.billId,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status.value as EPaymentStatus,
      description: entity.description || undefined,
      attempts: entity.paymentAttempts.map((attempt) => this.toDtoAttempt(attempt)),
      idempotencyKey: entity.idempotencyKey || undefined,
      version: entity.version,
      expiresAt: entity.expiresAt || undefined,
      canceledAt: entity.canceledAt || undefined,
      canceledBy: entity.canceledBy || undefined,
      cancelReason: entity.cancelReason || undefined,
      metadata: entity.metadata || {},
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt || null,
      deletedBy: entity.deletedBy || undefined,
    };
  }

  static toDtoAttempt(entity: PaymentAttemptEntity): PaymentAttemptResponseDto {
    return {
      paymentProviderId: entity.paymentProviderId,
      attemptNumber: entity.attemptNumber,
      status: entity.status.value as EPaymentAttemptStatus,
      transactions: entity.transactions.map((transaction) =>
        this.toDtoTransaction(transaction)
      ),
      failureReason: entity.failureReason,
      failureType: entity.failureType?.type,
      totalRefundedAmount: entity.totalRefundedAmount?.amount || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDtoTransaction(entity: PaymentTransactionEntity): PaymentTransactionResponseDto {
    return {
      transactionType: entity.transactionType,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status as ETransactionStatus,
      createdAt: entity.createdAt,
      description: entity.description || undefined,
      providerTransactionId: entity.providerTransactionId || undefined,
      metadata: entity.metadata || {},
      providerRequest: entity.providerRequest,
      providerResponse: entity.providerResponse,
      providerRequestHeaders: entity.providerRequestHeaders,
      providerResponseHeaders: entity.providerResponseHeaders,
      providerRequestTimestamp: entity.providerRequestTimestamp,
      providerResponseTimestamp: entity.providerResponseTimestamp,
    };
  }

  static toDtoList(entities: PaymentEntity[]): PaymentResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
