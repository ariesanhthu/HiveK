import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { EBillStatus } from '@/core/enums';

export const BillFilterSchema = CursorPaginationRequestSchema.extend({
  enterpriseId: z.string().optional(),
  status: z.enum(EBillStatus).optional(),
}).strict();

export class BillFilterDto extends createZodDto(BillFilterSchema) {}
export class BillGetListInputDto extends BillFilterDto {}
