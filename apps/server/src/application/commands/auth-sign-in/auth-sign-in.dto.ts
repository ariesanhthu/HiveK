import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthSignInInputSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export class AuthSignInInputDto extends createZodDto(AuthSignInInputSchema) {}

export const AuthSignInOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class AuthSignInOutputDto extends createZodDto(AuthSignInOutputSchema) {}
