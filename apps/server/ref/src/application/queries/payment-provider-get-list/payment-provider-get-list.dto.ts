import { z } from 'zod';
import { EPaymentMethod } from '@/core';

import { PaginationCursorQuerySchema } from '@/shared/dtos';

export const PaymentProviderGetListSchema = PaginationCursorQuerySchema.extend({
	isActive: z.coerce.boolean().optional(),
	methods: z.array(z.enum(EPaymentMethod)).optional(),
});

export type PaymentProviderGetListDto = z.infer<typeof PaymentProviderGetListSchema>;
