import { z } from 'zod';
import { EPurchaseType } from '@/core';

export const BillItemResponseSchema = z.object({
	packageId: z.string(),
	packageVariantId: z.string(),
	price: z.number(),
	taxPercent: z.number(),
	creditRefundAmount: z.number().optional(),
	purchaseType: z.enum(EPurchaseType),
});

export type BillItemResponseDto = z.infer<typeof BillItemResponseSchema>;
