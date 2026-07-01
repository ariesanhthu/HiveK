import { z } from 'zod';

export const SubscriptionGetHistoryByIdSchema = z.object({
	id: z.string(),
});

export type SubscriptionGetHistoryByIdDto = z.infer<typeof SubscriptionGetHistoryByIdSchema>;
