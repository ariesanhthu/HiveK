import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentHandleWebhookSchema = z
  .object({
    code: z.string().min(1),
    data: z.record(z.string(), z.unknown()),
  })
  .strict();

export class PaymentHandleWebhookInputDto extends createZodDto(
  PaymentHandleWebhookSchema,
) {}
