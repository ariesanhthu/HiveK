import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthResetPasswordInputSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6),
  newPassword: z.string().min(6),
});

export class AuthResetPasswordInputDto extends createZodDto(AuthResetPasswordInputSchema) {}

export const AuthResetPasswordOutputSchema = z.object({
  success: z.boolean(),
});

export class AuthResetPasswordOutputDto extends createZodDto(AuthResetPasswordOutputSchema) {}
