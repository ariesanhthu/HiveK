import { ERoleType } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserCreateInputSchema = z
  .object({
    email: z.email(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    password: z.string().min(6),
    fullName: z.string().min(1).max(100),
    type: z.enum(ERoleType),
    roleId: z.string().min(1),
  })
  .strict();

export class UserCreateInputDto extends createZodDto(UserCreateInputSchema) {}
