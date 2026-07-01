import { z } from 'zod';
import { EPaymentMethod, ECurrency } from '@/core/enums';

export const PaymentProviderReducedResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  displayName: z.string(),
  supportedMethods: z.array(z.enum([EPaymentMethod.CREDIT_CARD, EPaymentMethod.DEBIT_CARD, EPaymentMethod.QR_CODE])),
  supportedCurrencies: z.array(z.enum([ECurrency.VND, ECurrency.USD])),
  isActive: z.boolean(),
  supportsRefund: z.boolean(),
  supportsPartialRefund: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaymentProviderResponseSchema = PaymentProviderReducedResponseSchema.extend({
  supportsWebhook: z.boolean(),
  credentials: z.record(z.string(), z.unknown()),
  baseUrl: z.string().optional(),
  testUrl: z.string().optional(),
  webhookUrl: z.string().optional(),
  deletedAt: z.date().nullable().optional(),
  deletedBy: z.string().nullable().optional(),
});

export type PaymentProviderReducedResponseDto = z.infer<
  typeof PaymentProviderReducedResponseSchema
>;
export type PaymentProviderResponseDto = z.infer<typeof PaymentProviderResponseSchema>;
