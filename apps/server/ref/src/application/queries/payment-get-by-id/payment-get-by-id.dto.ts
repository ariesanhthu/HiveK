import { z } from 'zod';

export const PaymentGetByIdSchema = z.object({
	id: z.string(),
});

export type PaymentGetByIdDto = z.infer<typeof PaymentGetByIdSchema>;
