import { PaginationCursorQuerySchema } from '@/shared/dtos';
import { z } from 'zod';

export const WalletGetListSchema = PaginationCursorQuerySchema.extend({
	enterpriseId: z.string().optional(),
});

export type WalletGetListDto = z.infer<typeof WalletGetListSchema>;
