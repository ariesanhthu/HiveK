import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPaymentAttemptStatus, EPaymentStatus, ETransactionStatus } from '@/core/enums';

export const PaymentTransactionResponseSchema = z.object({
  transactionType: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum([ETransactionStatus.PENDING, ETransactionStatus.SUCCESS, ETransactionStatus.FAILED]),
  description: z.string().optional(),
  providerTransactionId: z.string().optional(),
  providerRequest: z.record(z.string(), z.unknown()).optional(),
  providerRequestHeaders: z.record(z.string(), z.unknown()).optional(),
  providerRequestTimestamp: z.iso.datetime().optional(),
  providerResponse: z.record(z.string(), z.unknown()).optional(),
  providerResponseHeaders: z.record(z.string(), z.unknown()).optional(),
  providerResponseTimestamp: z.iso.datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.iso.datetime(),
}).strict();

export class PaymentTransactionResponseDto extends createZodDto(PaymentTransactionResponseSchema) {}

export const PaymentAttemptResponseSchema = z.object({
  paymentProviderId: z.string(),
  attemptNumber: z.number(),
  status: z.enum([
    EPaymentAttemptStatus.INITIATED,
    EPaymentAttemptStatus.PROCESSING,
    EPaymentAttemptStatus.SUCCESS,
    EPaymentAttemptStatus.FAILED,
    EPaymentAttemptStatus.CANCELED,
    EPaymentAttemptStatus.PARTIALLY_REFUNDED,
    EPaymentAttemptStatus.REFUNDED,
  ]),
  providerTransactionId: z.string().optional(),
  failureReason: z.string().optional(),
  failureType: z.string().optional(),
  totalRefundedAmount: z.number().optional(),
  transactions: z.array(PaymentTransactionResponseSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export class PaymentAttemptResponseDto extends createZodDto(PaymentAttemptResponseSchema) {}

export const PaymentResponseSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  userId: z.string().nullable(),
  billId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum([
    EPaymentStatus.PENDING_PAYMENT_PROVIDER,
    EPaymentStatus.PENDING,
    EPaymentStatus.PROCESSING,
    EPaymentStatus.COMPLETED,
    EPaymentStatus.FAILED,
    EPaymentStatus.PARTIALLY_REFUNDED,
    EPaymentStatus.REFUNDED,
    EPaymentStatus.CANCELED,
  ]),
  description: z.string().optional(),
  idempotencyKey: z.string().optional(),
  version: z.number(),
  expiresAt: z.iso.datetime().optional(),
  canceledAt: z.iso.datetime().optional(),
  canceledBy: z.string().optional(),
  cancelReason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable().optional(),
  deletedBy: z.string().optional(),
}).strict();

export class PaymentResponseDto extends createZodDto(PaymentResponseSchema) {}

export const PaymentDetailResponseSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  userId: z.string().nullable(),
  billId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum([
    EPaymentStatus.PENDING_PAYMENT_PROVIDER,
    EPaymentStatus.PENDING,
    EPaymentStatus.PROCESSING,
    EPaymentStatus.COMPLETED,
    EPaymentStatus.FAILED,
    EPaymentStatus.PARTIALLY_REFUNDED,
    EPaymentStatus.REFUNDED,
    EPaymentStatus.CANCELED,
  ]),
  attempts: z.array(PaymentAttemptResponseSchema),
  description: z.string().optional(),
  idempotencyKey: z.string().optional(),
  version: z.number(),
  expiresAt: z.iso.datetime().optional(),
  canceledAt: z.iso.datetime().optional(),
  canceledBy: z.string().optional(),
  cancelReason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable().optional(),
  deletedBy: z.string().optional(),
}).strict();

export class PaymentDetailResponseDto extends createZodDto(PaymentDetailResponseSchema) {}

