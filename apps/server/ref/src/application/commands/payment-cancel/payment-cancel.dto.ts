import { z } from 'zod';

export const PaymentCancelSchema = z.object({
	paymentId: z.string(),
	reason: z.string(),
	canceledBy: z.string(),
});

export type PaymentCancelDto = z.infer<typeof PaymentCancelSchema>;
