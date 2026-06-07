import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ERoleType } from '@/core/enums';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';
import { RoleDto } from './role.dto';
import { UploadedFileDto } from './uploaded-file.dto';

const BaseUserDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  phone: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable(),
  roleId: z.string(),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AdminDtoSchema = BaseUserDtoSchema.extend({
  type: z.literal(ERoleType.ADMIN),
});

export const EnterpriseUserDtoSchema = BaseUserDtoSchema.extend({
  type: z.literal(ERoleType.ENTERPRISE),
  enterpriseIds: z.array(z.string()),
});

export const KOLUserDtoSchema = BaseUserDtoSchema.extend({
  type: z.literal(ERoleType.KOL),
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
  type: z.enum(ERoleType).optional(),
  roleId: z.string().optional(),
  isEmailVerified: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export class UserFilterDto extends createZodDto(UserFilterSchema) {}

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type UserDetailDto = DistributiveOmit<UserDto, 'avatar'> & {
  avatar: UploadedFileDto | null;
  role?: RoleDto;
};
