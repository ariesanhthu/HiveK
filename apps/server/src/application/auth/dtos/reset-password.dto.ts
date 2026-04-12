import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'

export const ResetPasswordInputSchema = z.object({
  email: z.email(),
});

// export type ResetPasswordInputDto = z.infer<typeof ResetPasswordInputSchema>;
export class ResetPasswordInputDto extends createZodDto(ResetPasswordInputSchema) {}

export const ResetPasswordOutputSchema = z.object({
  success: z.boolean(),
});

// export type ResetPasswordOutputDto = z.infer<typeof ResetPasswordOutputSchema>;
export class ResetPasswordOutputDto extends createZodDto(ResetPasswordOutputSchema) {}
