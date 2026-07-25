import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ScheduledPostCreateAndPublishInputSchema = z.object({
  socialPageId: z.string().min(1),
  content: z.string().min(1),
  mediaFileIds: z.array(z.string()).default([]),
  scheduledAt: z.string().datetime().optional(),
}).strict();

export class ScheduledPostCreateAndPublishInputDto extends createZodDto(ScheduledPostCreateAndPublishInputSchema) {}
