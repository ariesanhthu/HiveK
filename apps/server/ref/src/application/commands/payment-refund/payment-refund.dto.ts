import { z } from 'zod';

export const PaymentRefundSchema = z.object({
	paymentId: z.string(),
	amount: z.number().positive().optional(), // Optional for partial refund
	refundedBy: z.string(),
	idempotencyKey: z.string().optional(),
	reason: z.string().optional(), // For future metadata usage
});

export type PaymentRefundDto = z.infer<typeof PaymentRefundSchema>;
