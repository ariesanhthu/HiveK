import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';

export const RoleFilterSchema = CursorPaginationRequestSchema.extend({
  title: z.string().optional(),
  isBlocked: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export class RoleFilterDto extends createZodDto(RoleFilterSchema) {}
