import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthGoogleSignInInputSchema = z.object({
  googleId: z.string(),
  email: z.email(),
  displayName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export class AuthGoogleSignInInputDto extends createZodDto(AuthGoogleSignInInputSchema) {}

export const AuthGoogleSignInOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class AuthGoogleSignInOutputDto extends createZodDto(AuthGoogleSignInOutputSchema) {}
