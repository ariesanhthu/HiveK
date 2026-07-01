import { z } from 'zod';

export const BillCalculateItemSchema = z.object({
	packageId: z.string(),
	packageVariantId: z.string(),
});

export const BillCalculateSchema = z.object({
	enterpriseId: z.string().optional(),
	items: z.array(BillCalculateItemSchema).min(1),
});

export type BillCalculateDto = z.infer<typeof BillCalculateSchema>;
