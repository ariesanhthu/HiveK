import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseCreateInputSchema = z.object({
  companyName: z.string().min(1).max(200),
  description: z.string().max(2000),
  contactEmail: z.email(),
  contactPhone: z.string().min(1),
  website: z.url().nullable().optional(),
  taxId: z.string().nullable().optional(),
});

export class EnterpriseCreateInputDto extends createZodDto(EnterpriseCreateInputSchema) {}
