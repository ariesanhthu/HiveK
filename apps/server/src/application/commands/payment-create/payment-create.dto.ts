import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ECurrency } from '@/core/enums';

export const PaymentCreateSchema = z.object({
  idempotencyKey: z.string().min(1),
  enterpriseId: z.string().min(1),
  userId: z.string().optional().nullable(),
  billId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum([ECurrency.VND, ECurrency.USD]),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  paymentProviderId: z.string().min(1),
  createdBy: z.string().optional(),
}).strict();

export const PaymentCreateResponseSchema = z.object({
  paymentId: z.string(),
  attemptId: z.string(),
  paymentUrl: z.string().optional(),
});

export class PaymentCreateInputDto extends createZodDto(PaymentCreateSchema) {}
export type PaymentCreateResponseDto = z.infer<typeof PaymentCreateResponseSchema>;
