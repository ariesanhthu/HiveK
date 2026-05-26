import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';

export const RoleDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  permissions: z.array(z.string()),
  isBlocked: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export class RoleDto extends createZodDto(RoleDtoSchema) {}

export const RoleFilterSchema = CursorPaginationRequestSchema.extend({
  title: z.string().optional(),
  isBlocked: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export class RoleFilterDto extends createZodDto(RoleFilterSchema) {}
