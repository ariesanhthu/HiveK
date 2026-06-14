import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ReviewModerateInputSchema = z.object({
  action: z.enum(['approve', 'reject']),
}).strict();

export class ReviewModerateInputDto extends createZodDto(ReviewModerateInputSchema) {}
