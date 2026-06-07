import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ERoleType } from '@/core/enums';

export const RoleCreateInputSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  permissions: z.array(z.string()),
  type: z.nativeEnum(ERoleType),
});

export class RoleCreateInputDto extends createZodDto(RoleCreateInputSchema) {}
