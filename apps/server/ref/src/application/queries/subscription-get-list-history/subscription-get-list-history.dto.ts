import { PaginationCursorQuerySchema } from '@/shared/dtos';
import { z } from 'zod';

export const SubscriptionGetListHistorySchema = PaginationCursorQuerySchema.extend({
	enterpriseId: z.string().optional(),
});

export type SubscriptionGetListHistoryDto = z.infer<typeof SubscriptionGetListHistorySchema>;
