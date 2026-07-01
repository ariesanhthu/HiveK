import { z } from 'zod';
import { BillItemResponseSchema } from '@/application/dtos';

export const BillCalculateResponseSchema = z.object({
	items: z.array(BillItemResponseSchema),
	totalAmount: z.number(),
	creditAmountApplied: z.number(),
	taxAmount: z.number(),
	finalAmount: z.number(),
	currency: z.string(),
});

export type BillCalculateResponseDto = z.infer<typeof BillCalculateResponseSchema>;
