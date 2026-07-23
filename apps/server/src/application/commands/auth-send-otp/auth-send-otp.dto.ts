import { EOtpType } from '@/core/enums/otp-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthSendOtpInputSchema = z.object({
  email: z.email(),
  type: z.enum(EOtpType),
}).strict();

export class AuthSendOtpInputDto extends createZodDto(AuthSendOtpInputSchema) {}

export const AuthSendOtpOutputSchema = z.object({
  success: z.boolean(),
}).strict();

export class AuthSendOtpOutputDto extends createZodDto(AuthSendOtpOutputSchema) {}
