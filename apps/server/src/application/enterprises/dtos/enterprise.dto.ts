import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'

export const EnterpriseDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyName: z.string(),
  description: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  logoUrl: z.string().optional(),
  isVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// export type EnterpriseDto = z.infer<typeof EnterpriseDtoSchema>;
export class EnterpriseDto extends createZodDto(EnterpriseDtoSchema) {}
