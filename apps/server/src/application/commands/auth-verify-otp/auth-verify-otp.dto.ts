import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthVerifyOtpInputSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6),
}).strict();

export class AuthVerifyOtpInputDto extends createZodDto(AuthVerifyOtpInputSchema) {}

export const AuthVerifyOtpOutputSchema = z.object({
  success: z.boolean(),
}).strict();

export class AuthVerifyOtpOutputDto extends createZodDto(AuthVerifyOtpOutputSchema) {}
