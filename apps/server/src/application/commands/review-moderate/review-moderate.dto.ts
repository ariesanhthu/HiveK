import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ReviewModerateInputSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
  })
  .strict();

export class ReviewModerateInputDto extends createZodDto(
  ReviewModerateInputSchema,
) {}
