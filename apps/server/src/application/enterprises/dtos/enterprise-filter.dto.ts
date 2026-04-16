import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';

export const EnterpriseFilterSchema = CursorPaginationRequestSchema.extend({
  companyName: z.string().optional(),
  contactEmail: z.string().optional(),
  taxId: z.string().optional(),
  isVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export class EnterpriseFilterDto extends createZodDto(EnterpriseFilterSchema) {}
