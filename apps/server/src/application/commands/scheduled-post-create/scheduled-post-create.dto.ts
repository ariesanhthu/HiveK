import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ScheduledPostCreateInputSchema = z
  .object({
    socialPageId: z.string().min(1),
    content: z.string().min(1),
    mediaFileIds: z.array(z.string()).default([]),
    scheduledAt: z.string().datetime().optional(),
    campaignId: z.string().optional(),
  })
  .strict();

export class ScheduledPostCreateInputDto extends createZodDto(
  ScheduledPostCreateInputSchema,
) {}
