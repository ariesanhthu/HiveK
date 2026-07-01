import { z } from 'zod';

export const PaymentHandleWebhookSchema = z.object({
	code: z.string(),
	data: z.record(z.string(), z.unknown()),
});

export type PaymentHandleWebhookDto = z.infer<typeof PaymentHandleWebhookSchema>;
