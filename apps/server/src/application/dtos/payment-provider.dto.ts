import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
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
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const PaymentProviderResponseSchema = PaymentProviderReducedResponseSchema.extend({
  supportsWebhook: z.boolean(),
  credentials: z.record(z.string(), z.unknown()),
  baseUrl: z.string().optional(),
  testUrl: z.string().optional(),
  webhookUrl: z.string().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  deletedBy: z.string().nullable().optional(),
}).strict();

export class PaymentProviderReducedResponseDto extends createZodDto(PaymentProviderReducedResponseSchema) {}
export class PaymentProviderResponseDto extends createZodDto(PaymentProviderResponseSchema) {}

