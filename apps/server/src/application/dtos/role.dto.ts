import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { ERoleType } from '@/core/enums';

export const RoleDtoSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    permissions: z.array(z.string()),
    type: z.enum(ERoleType),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export class RoleDto extends createZodDto(RoleDtoSchema) {}

export const RoleFilterSchema = CursorPaginationRequestSchema.extend({
  title: z.string().optional(),
  type: z.enum(ERoleType).optional(),
});

export class RoleFilterDto extends createZodDto(RoleFilterSchema) {}
