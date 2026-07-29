import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

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
    accessibleEnterprises: z.array(
      z.object({
        enterpriseId: z.string(),
        role: z.string(),
      }),
    ),
  })
  .strict();

export class AuthSignInOutputDto extends createZodDto(AuthSignInOutputSchema) {}
