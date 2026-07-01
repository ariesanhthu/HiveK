import { z } from 'zod';

/**
 * Wallet Transaction Response DTO (Flattened - NO Money object)
 */
const _walletTransactionResponseSchema = z.object({
	id: z.string(),
	walletId: z.string(),
	type: z.string(),
	amountValue: z.number(),
	amountCurrency: z.string(),
	billId: z.string().optional(),
	idempotencyKey: z.string(),
	description: z.string(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	createdAt: z.date(),
});

export type WalletTransactionResponseDTO = z.infer<typeof _walletTransactionResponseSchema>;
