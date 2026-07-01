import { z } from 'zod';
import { PaginationCursorQuerySchema } from '@/shared/dtos';

export const PaymentEventGetByPaymentIdSchema = PaginationCursorQuerySchema.extend({
	paymentId: z.string(),
});

export type PaymentEventGetByPaymentIdDto = z.infer<typeof PaymentEventGetByPaymentIdSchema>;
