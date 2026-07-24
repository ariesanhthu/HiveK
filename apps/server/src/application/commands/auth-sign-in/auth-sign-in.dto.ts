import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthSignInInputSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1),
  })
  .strict();

export class AuthSignInInputDto extends createZodDto(AuthSignInInputSchema) {}

export const AuthSignInOutputSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict();

export class AuthSignInOutputDto extends createZodDto(AuthSignInOutputSchema) {}
