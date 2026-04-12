import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'

export const UpdateProfileInputSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// export type UpdateProfileInputDto = z.infer<typeof UpdateProfileInputSchema>;
export class UpdateProfileInputDto extends createZodDto(UpdateProfileInputSchema) {}

export const UpdateProfileOutputSchema = z.object({
  success: z.boolean(),
});

// export type UpdateProfileOutputDto = z.infer<typeof UpdateProfileOutputSchema>;
export class UpdateProfileOutputDto extends createZodDto(UpdateProfileOutputSchema) {}
