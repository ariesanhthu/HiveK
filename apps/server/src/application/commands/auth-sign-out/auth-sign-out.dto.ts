import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AuthSignOutInputSchema = z.object({});

export class AuthSignOutInputDto extends createZodDto(AuthSignOutInputSchema) {}

export const AuthSignOutOutputSchema = z.object({
  success: z.boolean(),
});

export class AuthSignOutOutputDto extends createZodDto(AuthSignOutOutputSchema) {}