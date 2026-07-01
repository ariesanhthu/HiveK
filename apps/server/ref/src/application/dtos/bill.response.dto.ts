import { z } from 'zod';
import { EBillType, EBillStatus } from '@/core';
import { BillItemResponseSchema } from './bill-item.response.dto';

export const BillResponseSchema = z.object({
	id: z.string(),
	billCode: z.string(),
	enterpriseId: z.string(),
	type: z.enum(EBillType),
	status: z.enum(EBillStatus),
	items: z.array(BillItemResponseSchema),
	totalAmount: z.number(),
	creditAmountApplied: z.number(),
	creditAmountRefund: z.number().optional(),
	taxAmount: z.number(),
	finalAmount: z.number(),
	currency: z.string(),
	expiresAt: z.date().nullable(),
	createdAt: z.date(),
});

export type BillResponseDto = z.infer<typeof BillResponseSchema>;
