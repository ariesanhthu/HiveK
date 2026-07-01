import { z } from 'zod';

export const PaymentGetByBillIdSchema = z.object({
	billId: z.string(),
});

export type PaymentGetByBillIdDto = z.infer<typeof PaymentGetByBillIdSchema>;
