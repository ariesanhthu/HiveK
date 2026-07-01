import { z } from 'zod';

export const PaymentRetrySchema = z.object({
	paymentId: z.string(),
	paymentProviderId: z.string(), // This is the CompanyPaymentProviderCredential ID
	createdBy: z.string().optional(),
	idempotencyKey: z.string(),
});

export type PaymentRetryDto = z.infer<typeof PaymentRetrySchema>;
