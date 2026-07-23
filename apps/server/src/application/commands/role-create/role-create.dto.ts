import { ERoleType } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RoleCreateInputSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  permissions: z.array(z.string()),
  type: z.enum(ERoleType),
}).strict();

export class RoleCreateInputDto extends createZodDto(RoleCreateInputSchema) {}
