import { ERoleType } from '@/core/enums/role-type.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthGoogleSignInInputSchema = z
  .object({
    googleId: z.string(),
    email: z.email(),
    displayName: z.string().optional(),
    avatarUrl: z.string().nullable().optional(),
    type: z.nativeEnum(ERoleType).optional(),
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
