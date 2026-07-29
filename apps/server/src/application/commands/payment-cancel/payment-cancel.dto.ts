import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentCancelSchema = z
  .object({
    paymentId: z.string().min(1),
    reason: z.string().optional(),
    canceledBy: z.string().optional(),
  })
  .strict();

export class PaymentCancelInputDto extends createZodDto(PaymentCancelSchema) {}
