import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { UserType } from '@/core/enums/user-type.enum';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';

const BaseUserDtoSchema = z.object({
  id: z.string(),
  email: z.email(),
  phone: z.string(),
  fullName: z.string(),
  roleId: z.string(),
  isEmailVerified: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const AdminDtoSchema = BaseUserDtoSchema.extend({
  type: z.literal(UserType.ADMIN),
});

export const EnterpriseUserDtoSchema = BaseUserDtoSchema.extend({
  type: z.literal(UserType.ENTERPRISE),
  enterpriseId: z.string(),
});

export const KOLUserDtoSchema = BaseUserDtoSchema.extend({
  type: z.literal(UserType.KOL),
});

export const UserDtoSchema = z.discriminatedUnion('type', [
  AdminDtoSchema,
  EnterpriseUserDtoSchema,
  KOLUserDtoSchema,
]);

export type UserDto = z.infer<typeof UserDtoSchema>;
export class AdminDto extends createZodDto(AdminDtoSchema) {}
export class EnterpriseUserDto extends createZodDto(EnterpriseUserDtoSchema) {}
export class KOLUserDto extends createZodDto(KOLUserDtoSchema) {}

export const UserFilterSchema = CursorPaginationRequestSchema.extend({
  email: z.string().optional(),
  phone: z.string().optional(),
  fullName: z.string().optional(),
  type: z.enum(UserType).optional(),
  roleId: z.string().optional(),
  isEmailVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export class UserFilterDto extends createZodDto(UserFilterSchema) {}
