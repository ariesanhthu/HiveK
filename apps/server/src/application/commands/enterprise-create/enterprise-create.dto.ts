import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EnterpriseCreateInputSchema = z.object({
  companyName: z.string().min(1).max(200),
  description: z.string().max(2000),
  contactEmail: z.email(),
  contactPhone: z.string().min(1),
  website: z.url().nullable().optional(),
  taxId: z.string().nullable().optional(),
}).strict();

export class EnterpriseCreateInputDto extends createZodDto(EnterpriseCreateInputSchema) {}
