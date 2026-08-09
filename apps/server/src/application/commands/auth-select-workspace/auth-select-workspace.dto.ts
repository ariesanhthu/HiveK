import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthSelectWorkspaceInputSchema = z
  .object({
    enterpriseId: z.string().min(1),
  })
  .strict();

export class AuthSelectWorkspaceInputDto extends createZodDto(
  AuthSelectWorkspaceInputSchema,
) {}

export const AuthSelectWorkspaceOutputSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict();

export class AuthSelectWorkspaceOutputDto extends createZodDto(
  AuthSelectWorkspaceOutputSchema,
) {}
