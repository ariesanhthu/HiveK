import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ERoleType } from '@/core/enums/role-type.enum';

export const AuthGoogleSignInInputSchema = z
  .object({
    googleId: z.string(),
    email: z.email(),
    displayName: z.string().optional(),
    avatarUrl: z.string().nullable().optional(),
    type: z.enum(ERoleType).optional(),
  })
  .strict();

export class AuthGoogleSignInInputDto extends createZodDto(
  AuthGoogleSignInInputSchema,
) {}

export const AuthGoogleSignInOutputSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict();

export class AuthGoogleSignInOutputDto extends createZodDto(
  AuthGoogleSignInOutputSchema,
) {}
