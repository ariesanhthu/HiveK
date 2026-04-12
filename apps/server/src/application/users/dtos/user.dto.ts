import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'
import { UserType } from '@/core/enums/user-type.enum';

const BaseUserDtoSchema = z.object({
  id: z.string(),
  email: z.email(),
  phone: z.string(),
  fullName: z.string(),
  roleId: z.string(),
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
// export class UserDto extends createZodDto(UserDtoSchema) {}
// export type AdminDto = z.infer<typeof AdminDtoSchema>;
export class AdminDto extends createZodDto(AdminDtoSchema) {}
// export type EnterpriseUserDto = z.infer<typeof EnterpriseUserDtoSchema>;
export class EnterpriseUserDto extends createZodDto(EnterpriseUserDtoSchema) {}
// export type KOLUserDto = z.infer<typeof KOLUserDtoSchema>;
export class KOLUserDto extends createZodDto(KOLUserDtoSchema) {}
