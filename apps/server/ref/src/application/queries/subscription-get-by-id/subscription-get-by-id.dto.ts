import { z } from 'zod';

export const SubscriptionGetByIdSchema = z.object({
	id: z.string(),
});

export type SubscriptionGetByIdDto = z.infer<typeof SubscriptionGetByIdSchema>;
