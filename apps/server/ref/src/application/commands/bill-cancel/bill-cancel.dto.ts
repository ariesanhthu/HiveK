import { z } from 'zod';

export const BillCancelSchema = z.object({
	billId: z.string(),
});

export type BillCancelDto = z.infer<typeof BillCancelSchema>;
