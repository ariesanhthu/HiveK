import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthVerifyOtpInputSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6),
});

export class AuthVerifyOtpInputDto extends createZodDto(AuthVerifyOtpInputSchema) {}

export const AuthVerifyOtpOutputSchema = z.object({
  success: z.boolean(),
});

export class AuthVerifyOtpOutputDto extends createZodDto(AuthVerifyOtpOutputSchema) {}
