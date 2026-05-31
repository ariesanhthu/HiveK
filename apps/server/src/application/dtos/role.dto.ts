import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';
import { ERoleType } from '@/core/enums';

export const RoleDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  permissions: z.array(z.string()),
  type: z.nativeEnum(ERoleType),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export class RoleDto extends createZodDto(RoleDtoSchema) {}

export const RoleFilterSchema = CursorPaginationRequestSchema.extend({
  title: z.string().optional(),
  type: z.nativeEnum(ERoleType).optional(),
});

export class RoleFilterDto extends createZodDto(RoleFilterSchema) {}

export const RoleCreateInputSchema = z.object({
  title: z.string().min(1),
  permissions: z.array(z.string()),
  type: z.nativeEnum(ERoleType),
});

export class RoleCreateInputDto extends createZodDto(RoleCreateInputSchema) {}

export const RoleUpdateInputSchema = z.object({
  title: z.string().min(1).optional(),
  permissions: z.array(z.string()).optional(),
  type: z.nativeEnum(ERoleType).optional(),
});

export class RoleUpdateInputDto extends createZodDto(RoleUpdateInputSchema) {}
