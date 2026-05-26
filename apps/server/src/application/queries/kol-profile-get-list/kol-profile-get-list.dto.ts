import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';

export const KolProfileFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  isVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export class KolProfileFilterDto extends createZodDto(KolProfileFilterSchema) {}
