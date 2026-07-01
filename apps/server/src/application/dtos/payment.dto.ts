import { z } from 'zod';
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
  providerRequestTimestamp: z.date().optional(),
  providerResponse: z.record(z.string(), z.unknown()).optional(),
  providerResponseHeaders: z.record(z.string(), z.unknown()).optional(),
  providerResponseTimestamp: z.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
});

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
  createdAt: z.date(),
  updatedAt: z.date(),
});

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
  expiresAt: z.date().optional(),
  canceledAt: z.date().optional(),
  canceledBy: z.string().optional(),
  cancelReason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  deletedBy: z.string().optional(),
});

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
  expiresAt: z.date().optional(),
  canceledAt: z.date().optional(),
  canceledBy: z.string().optional(),
  cancelReason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  deletedBy: z.string().optional(),
});

export type PaymentAttemptResponseDto = z.infer<typeof PaymentAttemptResponseSchema>;
export type PaymentTransactionResponseDto = z.infer<typeof PaymentTransactionResponseSchema>;
export type PaymentResponseDto = z.infer<typeof PaymentResponseSchema>;
export type PaymentDetailResponseDto = z.infer<typeof PaymentDetailResponseSchema>;
