import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPostStatus } from '@/core/enums/post-status.enum';

export const ScheduledPostDtoSchema = z
  .object({
    id: z.string(),
    enterpriseId: z.string(),
    socialPageId: z.string(),
    campaignId: z.string().optional(),
    platformCode: z.string(),
    content: z.string(),
    mediaFileIds: z.array(z.string()),
    scheduledAt: z.iso.datetime(),
    status: z.enum(EPostStatus),
    publishedAt: z.iso.datetime().nullable(),
    platformPostId: z.string().nullable(),
    failReason: z.string().nullable(),
    createdBy: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export class ScheduledPostDto extends createZodDto(ScheduledPostDtoSchema) {}
