import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const BillGetByIdSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export class BillGetByIdInputDto extends createZodDto(BillGetByIdSchema) {}
