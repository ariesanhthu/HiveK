import { z } from 'zod';

export const PaymentProviderGetByIdSchema = z.object({
	id: z.string(),
});

export type PaymentProviderGetByIdDto = z.infer<typeof PaymentProviderGetByIdSchema>;
