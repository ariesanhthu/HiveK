import { z } from 'zod';

export const SubscriptionGetByEnterpriseSchema = z.object({
	enterpriseId: z.string(),
});

export type SubscriptionGetByEnterpriseDto = z.infer<typeof SubscriptionGetByEnterpriseSchema>;
