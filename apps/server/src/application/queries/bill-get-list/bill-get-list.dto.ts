import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';

export const BillFilterSchema = CursorPaginationRequestSchema.extend({
  enterpriseId: z.string().optional(),
  status: z.string().optional(),
}).strict();

export class BillFilterDto extends createZodDto(BillFilterSchema) {}
export class BillGetListInputDto extends BillFilterDto {}
