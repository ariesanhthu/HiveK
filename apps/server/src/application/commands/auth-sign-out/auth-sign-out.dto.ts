import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthSignOutInputSchema = z.object({}).strict();

export class AuthSignOutInputDto extends createZodDto(AuthSignOutInputSchema) {}

export const AuthSignOutOutputSchema = z.object({
  success: z.boolean(),
}).strict();

export class AuthSignOutOutputDto extends createZodDto(AuthSignOutOutputSchema) {}
