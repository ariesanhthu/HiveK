import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UserUpdateProfileInputSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
  })
  .strict();

export class UserUpdateProfileInputDto extends createZodDto(
  UserUpdateProfileInputSchema,
) {}

export const UserUpdateProfileOutputSchema = z
  .object({
    success: z.boolean(),
  })
  .strict();

export class UserUpdateProfileOutputDto extends createZodDto(
  UserUpdateProfileOutputSchema,
) {}
