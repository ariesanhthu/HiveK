import { EReviewStatus } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CursorPaginationRequestSchema } from './pagination.dto';

export const ReviewDtoSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  authorName: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  status: z.enum(EReviewStatus),
  createdAt: z.any(),
}).strict();

export class ReviewDto extends createZodDto(ReviewDtoSchema) {}

export const ReviewFilterSchema = CursorPaginationRequestSchema.extend({
  proposalId: z.string().optional(),
  status: z.string().optional(),
}).strict();

export class ReviewFilterDto extends createZodDto(ReviewFilterSchema) {}
