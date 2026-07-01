import { z } from 'zod';
import { EPaymentStatus } from '@/core';
import { PaginationCursorQueryWithCompanySchema } from '@/shared/dtos';

export const PaymentGetListSchema = PaginationCursorQueryWithCompanySchema.extend({
	status: z.enum(EPaymentStatus).optional(),
	isDeleted: z.coerce.boolean().optional(),
	startDate: z.coerce.date().optional(), // Or z.string().datetime() if input is string
	endDate: z.coerce.date().optional(),
});

export type PaymentGetListDto = z.infer<typeof PaymentGetListSchema>;
