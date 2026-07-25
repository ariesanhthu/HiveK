import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const BillCancelSchema = z.object({
  billId: z.string().min(1),
}).strict();

export class BillCancelInputDto extends createZodDto(BillCancelSchema) {}
