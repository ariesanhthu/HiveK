import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPaymentMethod, ECurrency } from '@/core/enums';

export const PaymentProviderCreateSchema = z
  .object({
    code: z.string().min(1),
    displayName: z.string().min(1),
    supportedMethods: z.array(
      z.enum([
        EPaymentMethod.CREDIT_CARD,
        EPaymentMethod.DEBIT_CARD,
        EPaymentMethod.QR_CODE,
      ]),
    ),
    supportedCurrencies: z.array(z.enum([ECurrency.VND, ECurrency.USD])),
    credentials: z.record(z.string(), z.unknown()).optional(),
    isActive: z.boolean().default(true),
    supportsWebhook: z.boolean().default(false),
    supportsRefund: z.boolean().default(false),
    supportsPartialRefund: z.boolean().default(false),
    baseUrl: z.string().optional().nullable(),
    testUrl: z.string().optional().nullable(),
    webhookUrl: z.string().optional().nullable(),
  })
  .strict();

export class PaymentProviderCreateInputDto extends createZodDto(
  PaymentProviderCreateSchema,
) {}
