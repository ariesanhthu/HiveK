import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ReviewSecurityMetadataInputSchema = z.object({
  ipHash: z.string().min(1),
  browserFingerprint: z.string().min(1),
  recaptchaScore: z.number().min(0).max(1),
}).strict();

export const ReviewCreateInputSchema = z.object({
  proposalId: z.string().min(1),
  authorName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
  securityMetadata: ReviewSecurityMetadataInputSchema,
}).strict();

export class ReviewCreateInputDto extends createZodDto(ReviewCreateInputSchema) {}
