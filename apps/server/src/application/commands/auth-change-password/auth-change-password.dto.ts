import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthChangePasswordInputSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
  otpCode: z.string().length(6),
});

export class AuthChangePasswordInputDto extends createZodDto(AuthChangePasswordInputSchema) {}

export const AuthChangePasswordOutputSchema = z.object({
  success: z.boolean(),
});

export class AuthChangePasswordOutputDto extends createZodDto(AuthChangePasswordOutputSchema) {}
