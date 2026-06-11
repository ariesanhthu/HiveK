import { ERoleType } from '@/core/enums/role-type.enum';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UserUpdateInputSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  fullName: z.string().min(1).max(100).optional(),
}).strict();

export class UserUpdateInputDto extends createZodDto(UserUpdateInputSchema) {}
