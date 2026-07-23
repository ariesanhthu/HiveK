import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const KolProfileFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  isVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export class KolProfileFilterDto extends createZodDto(KolProfileFilterSchema) {}
