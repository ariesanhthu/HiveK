import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthRefreshTokenInputSchema = z.object({
  refreshToken: z.string().optional(),
}).strict();

export class AuthRefreshTokenInputDto extends createZodDto(AuthRefreshTokenInputSchema) {}

export const AuthRefreshTokenOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
}).strict();

export class AuthRefreshTokenOutputDto extends createZodDto(AuthRefreshTokenOutputSchema) {}
