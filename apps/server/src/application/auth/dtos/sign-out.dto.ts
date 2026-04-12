import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'

export const SignOutInputSchema = z.object({
  userId: z.string(),
});

// export type SignOutInputDto = z.infer<typeof SignOutInputSchema>;
export class SignOutInputDto extends createZodDto(SignOutInputSchema) {}

export const SignOutOutputSchema = z.object({
  success: z.boolean(),
});

// export type SignOutOutputDto = z.infer<typeof SignOutOutputSchema>;
export class SignOutOutputDto extends createZodDto(SignOutOutputSchema) {}
