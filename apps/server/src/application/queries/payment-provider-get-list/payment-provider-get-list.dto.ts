import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';

export const PaymentProviderFilterSchema = CursorPaginationRequestSchema.extend(
  {
    methods: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  },
).strict();

export class PaymentProviderFilterDto extends createZodDto(
  PaymentProviderFilterSchema,
) {}
export class PaymentProviderGetListInputDto extends PaymentProviderFilterDto {}
