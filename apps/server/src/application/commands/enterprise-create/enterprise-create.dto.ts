import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseCreateInputSchema = z.object({
  companyName: z.string(),
  description: z.string(),
  contactEmail: z.email(),
  contactPhone: z.string(),
  website: z.url().nullable().optional(),
  taxId: z.string().nullable().optional(),
  logoUrlId: z.string().nullable().optional(),
});

export class EnterpriseCreateInputDto extends createZodDto(EnterpriseCreateInputSchema) {}
