import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';
import { UserType } from '@/core/enums';

export const UserFilterSchema = CursorPaginationRequestSchema.extend({
  email: z.string().optional(),
  phone: z.string().optional(),
  fullName: z.string().optional(),
  type: z.enum(UserType).optional(),
  roleId: z.string().optional(),
  isEmailVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export class UserFilterDto extends createZodDto(UserFilterSchema) {}
