import { ESubscriptionStatus } from '@/core';
import { PaginationCursorQuerySchema } from '@/shared/dtos';
import { z } from 'zod';

export const SubscriptionGetListSchema = PaginationCursorQuerySchema.extend({
	enterpriseId: z.string().optional(),
	status: z.enum(ESubscriptionStatus).optional(),
});

export type SubscriptionGetListDto = z.infer<typeof SubscriptionGetListSchema>;
