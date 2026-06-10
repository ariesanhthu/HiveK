import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EOtpType } from '@/core/enums/otp-type.enum';

export const AuthSendOtpInputSchema = z.object({
  email: z.email(),
  type: z.enum(EOtpType),
});

export class AuthSendOtpInputDto extends createZodDto(AuthSendOtpInputSchema) {}

export const AuthSendOtpOutputSchema = z.object({
  success: z.boolean(),
});

export class AuthSendOtpOutputDto extends createZodDto(AuthSendOtpOutputSchema) {}
