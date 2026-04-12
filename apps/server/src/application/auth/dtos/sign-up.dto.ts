import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'

export const SignUpInputSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

// export type SignUpInputDto = z.infer<typeof SignUpInputSchema>;
export class SignUpInputDto extends createZodDto(SignUpInputSchema) {}

export const SignUpOutputSchema = z.object({
  userId: z.string(),
});

// export type SignUpOutputDto = z.infer<typeof SignUpOutputSchema>;
export class SignUpOutputDto extends createZodDto(SignUpOutputSchema) {}
