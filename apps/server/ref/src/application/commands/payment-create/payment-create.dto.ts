import { z } from 'zod';
import { ECurrency } from '@/core';

export const PaymentCreateSchema = z.object({
	enterpriseId: z.string(),
	userId: z.string().optional(),
	billId: z.string(),
	amount: z.number().positive(),
	currency: z.enum(ECurrency),
	description: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	idempotencyKey: z.string(),
	paymentProviderId: z.string(),
	createdBy: z.string().optional(),
});

export type PaymentCreateDto = z.infer<typeof PaymentCreateSchema>;

export const PaymentCreateResponseSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
	paymentUrl: z.string().optional(),
});

export type PaymentCreateResponseDto = z.infer<typeof PaymentCreateResponseSchema>;
