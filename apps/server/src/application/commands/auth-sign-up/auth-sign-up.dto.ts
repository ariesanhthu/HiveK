import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthSignUpInputSchema = z
  .object({
    email: z.email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    fullName: z.string().optional(),
  })
  .strict();

export class AuthSignUpInputDto extends createZodDto(AuthSignUpInputSchema) {}

export const AuthSignUpOutputSchema = z
  .object({
    userId: z.string(),
  })
  .strict();

export class AuthSignUpOutputDto extends createZodDto(AuthSignUpOutputSchema) {}
