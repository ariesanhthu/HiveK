import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentVoidAuthorizationSchema = z
  .object({
    paymentId: z.string().min(1),
    reason: z.string().optional(),
    voidedBy: z.string().optional(),
  })
  .strict();

export class PaymentVoidAuthorizationInputDto extends createZodDto(
  PaymentVoidAuthorizationSchema,
) {}
