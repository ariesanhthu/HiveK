import { z } from 'zod';

export const WalletTransactionGetByIdSchema = z.object({
	id: z.string().min(1, 'Transaction ID is required'),
});

export type WalletTransactionGetByIdDto = z.infer<typeof WalletTransactionGetByIdSchema>;
