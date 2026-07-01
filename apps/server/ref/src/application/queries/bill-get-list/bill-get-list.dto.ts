import { PaginationCursorQuerySchema } from '@/shared/dtos';
import { z } from 'zod';

export const BillGetListSchema = PaginationCursorQuerySchema.extend({
	enterpriseId: z.string().optional(),
	status: z.string().optional(),
});

export type BillGetListDto = z.infer<typeof BillGetListSchema>;
