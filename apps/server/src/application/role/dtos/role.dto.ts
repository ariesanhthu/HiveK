import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'

export const RoleDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  permissions: z.array(z.string()),
  isBlocked: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// export type RoleDto = z.infer<typeof RoleDtoSchema>;
export class RoleDto extends createZodDto(RoleDtoSchema) {}
