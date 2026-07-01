import { z } from 'zod';

export const WalletGetByIdSchema = z.object({
	id: z.string().min(1, 'Wallet ID is required'),
});

export type WalletGetByIdDto = z.infer<typeof WalletGetByIdSchema>;
