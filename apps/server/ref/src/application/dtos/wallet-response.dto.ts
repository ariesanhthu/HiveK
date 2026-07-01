import { z } from 'zod';

/**
 * Wallet Response DTO (Flattened - NO Money object)
 */
const _walletResponseSchema = z.object({
	id: z.string(),
	enterpriseId: z.string(),
	balanceAmount: z.number(),
	balanceCurrency: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type WalletResponseDTO = z.infer<typeof _walletResponseSchema>;
