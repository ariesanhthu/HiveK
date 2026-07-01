import { z } from 'zod';
import { ECurrency } from '@/core';

export const QuotaItemDtoSchema = z.object({
	code: z.string().min(1),
	limit: z.number(),
});

export const FeatureSchema = z.object({
	code: z.string().min(1),
	permissions: z.array(z.string().min(1)),
});

export const VariantSchema = z.object({
	title: z.string().min(1),
	durationMonths: z.number().int().min(1),
	price: z.number().min(0),
	priceAfterDiscount: z.number().min(0),
	tax: z.number().min(0),
	currency: z.enum(ECurrency),
	extraQuotas: z.array(QuotaItemDtoSchema),
});

export type QuotaItemDto = z.infer<typeof QuotaItemDtoSchema>;
export type FeatureDto = z.infer<typeof FeatureSchema>;
export type VariantDto = z.infer<typeof VariantSchema>;
