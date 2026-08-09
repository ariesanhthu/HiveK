import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const BillCalculateItemSchema = z
  .object({
    packageId: z.string().min(1),
    packageVariantId: z.string().min(1),
  })
  .strict();

export const BillCalculateSchema = z
  .object({
    enterpriseId: z.string().optional().nullable(),
    items: z.array(BillCalculateItemSchema).min(1),
  })
  .strict();

export class BillCalculateInputDto extends createZodDto(BillCalculateSchema) {}
