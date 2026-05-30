import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseUpdateInputSchema = z.object({
  companyName: z.string().optional(),
  description: z.string().optional(),
  contactEmail: z.email().optional(),
  contactPhone: z.string().optional(),
  website: z.url().nullable().optional(),
  taxId: z.string().nullable().optional(),
  logoUrlId: z.string().nullable().optional(),
});

export class EnterpriseUpdateInputDto extends createZodDto(EnterpriseUpdateInputSchema) {}
