import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPaymentMethod, ECurrency } from '@/core/enums';

export const PaymentProviderUpdateSchema = z.object({
  id: z.string().min(1),
  updatedBy: z.string().min(1),

  displayName: z.string().min(1).optional(),
  supportedMethods: z.array(z.enum([EPaymentMethod.CREDIT_CARD, EPaymentMethod.DEBIT_CARD, EPaymentMethod.QR_CODE])).optional(),
  supportedCurrencies: z.array(z.enum([ECurrency.VND, ECurrency.USD])).optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  supportsWebhook: z.boolean().optional(),
  supportsRefund: z.boolean().optional(),
  supportsPartialRefund: z.boolean().optional(),
  baseUrl: z.string().optional().nullable(),
  testUrl: z.string().optional().nullable(),
  webhookUrl: z.string().optional().nullable(),
}).strict();

export class PaymentProviderUpdateInputDto extends createZodDto(PaymentProviderUpdateSchema) {}
