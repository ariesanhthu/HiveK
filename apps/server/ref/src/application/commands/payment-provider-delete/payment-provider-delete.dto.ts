import { z } from 'zod';

export const PaymentProviderDeleteSchema = z.object({
	id: z.string(),
	deletedBy: z.string(),
});

export type PaymentProviderDeleteDto = z.infer<typeof PaymentProviderDeleteSchema>;

export const PaymentProviderDeleteResponseSchema = z.object({
	success: z.boolean(),
});

export type PaymentProviderDeleteResponseDto = z.infer<typeof PaymentProviderDeleteResponseSchema>;
