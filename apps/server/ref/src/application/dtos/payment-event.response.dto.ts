import { z } from 'zod';
import { EPaymentEventType } from '@/core';

export const PaymentEventResponseSchema = z.object({
	id: z.string(),
	paymentId: z.string(),
	paymentAttemptId: z.string().nullable(),
	eventType: z.enum(EPaymentEventType),
	triggerType: z.enum(['USER', 'ADMIN', 'SYSTEM'] as const),
	triggeredBy: z.string(),
	fieldChanges: z.record(
		z.string(),
		z.object({
			old: z.any(),
			new: z.any(),
		})
	),
	occurredAt: z.date(),
});

export type PaymentEventResponseDto = z.infer<typeof PaymentEventResponseSchema>;
