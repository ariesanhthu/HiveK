import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentCaptureSchema = z
  .object({
    paymentId: z.string().min(1),
    capturedBy: z.string().optional(),
  })
  .strict();

export class PaymentCaptureInputDto extends createZodDto(
  PaymentCaptureSchema,
) {}
