import { z } from 'zod';

export const BillCreateItemSchema = z.object({
	packageId: z.string(),
	packageVariantId: z.string(),
});

export const BillCreateSchema = z.object({
	enterpriseId: z.string(),
	items: z.array(BillCreateItemSchema).min(1),
});

export type BillCreateDto = z.infer<typeof BillCreateSchema>;
