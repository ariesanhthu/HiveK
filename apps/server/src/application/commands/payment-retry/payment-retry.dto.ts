import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentRetrySchema = z
  .object({
    paymentId: z.string().min(1),
    paymentProviderId: z.string().min(1),
    idempotencyKey: z.string().min(1),
    createdBy: z.string().optional(),
  })
  .strict();

export class PaymentRetryInputDto extends createZodDto(PaymentRetrySchema) {}
