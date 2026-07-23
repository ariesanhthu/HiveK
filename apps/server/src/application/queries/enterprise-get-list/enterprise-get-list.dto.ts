import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EnterpriseFilterSchema = CursorPaginationRequestSchema.extend({
  companyName: z.string().optional(),
  contactEmail: z.string().optional(),
  taxId: z.string().optional(),
  isVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export class EnterpriseFilterDto extends createZodDto(EnterpriseFilterSchema) {}
