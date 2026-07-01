import { z } from 'zod';

export const PaymentEventGetByIdSchema = z.object({
	id: z.string(),
});

export type PaymentEventGetByIdDto = z.infer<typeof PaymentEventGetByIdSchema>;
