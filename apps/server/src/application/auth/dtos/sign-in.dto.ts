import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'

export const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string(),
});

// export type SignInInputDto = z.infer<typeof SignInInputSchema>;
export class SignInInputDto extends createZodDto(SignInInputSchema) {}

export const SignInOutputSchema = z.object({
  accessToken: z.string(),
});

// export type SignInOutputDto = z.infer<typeof SignInOutputSchema>;
export class SignInOutputDto extends createZodDto(SignInOutputSchema) {}
