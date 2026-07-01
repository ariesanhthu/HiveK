import { PaginationCursorQuerySchema } from '@/shared/dtos';
import { z } from 'zod';

export const WalletGetListTransactionSchema = PaginationCursorQuerySchema.extend({
	enterpriseId: z.string().optional(),
});

export type WalletGetListTransactionDto = z.infer<typeof WalletGetListTransactionSchema>;
