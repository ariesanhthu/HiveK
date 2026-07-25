import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const BillCreateItemSchema = z.object({
  packageId: z.string().min(1),
  packageVariantId: z.string().min(1),
}).strict();

export const BillCreateSchema = z.object({
  enterpriseId: z.string().min(1),
  items: z.array(BillCreateItemSchema).min(1),
}).strict();

export class BillCreateInputDto extends createZodDto(BillCreateSchema) {}
export type BillCreateItemDto = z.infer<typeof BillCreateItemSchema>;
