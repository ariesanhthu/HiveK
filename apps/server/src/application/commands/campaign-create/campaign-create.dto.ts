import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ESchedulePostStatus, EOutputType, EOutputStatus } from '@/core/enums';

export const CampaignKOLOutputInputSchema = z
  .object({
    id: z.string().optional(),
    campaignParticipantId: z.string().min(1),
    platformId: z.string().min(1),
    uniqueId: z.string().nullable().optional(),
    outputType: z.enum(EOutputType),
    title: z.string().min(1),
    isScheduleForPost: z.boolean(),
    scheduledAt: z.iso.datetime().nullable().optional(),
    fileId: z.string().nullable().optional(),
    status: z.enum(EOutputStatus).optional().default(EOutputStatus.DRAFT),
    url: z.url().nullable().optional(),
    postedAt: z.iso.datetime().nullable().optional(),
    isTrackingActive: z.boolean().optional().default(false),
  })
  .strict();

export const CampaignEnterpriseOutputInputSchema = z
  .object({
    id: z.string().optional(),
    platformId: z.string().min(1),
    uniqueId: z.string().nullable().optional(),
    outputType: z.enum(EOutputType),
    title: z.string().min(1),
    isScheduleForPost: z.boolean(),
    scheduledAt: z.iso.datetime().nullable().optional(),
    fileId: z.string().nullable().optional(),
    status: z.enum(EOutputStatus).optional().default(EOutputStatus.DRAFT),
    url: z.string().url().nullable().optional(),
    postedAt: z.iso.datetime().nullable().optional(),
    isTrackingActive: z.boolean().optional().default(false),
  })
  .strict();

// @code-comment(SchedulePostSchema): Kept for future reuse.
// export const SchedulePostSchema = z.object({ ... }).strict();

export const ScheduleDaySchema = z
  .object({
    date: z.iso.datetime(),
    label: z.string().max(200).optional(),
    posts: z.array(z.string()), // ScheduledPost IDs
  })
  .strict();

export const CampaignScheduleSchema = z
  .object({
    timeline: z.array(ScheduleDaySchema),
  })
  .strict();

export const CampaignCreateInputSchema = z
  .object({
    ownerId: z.string().optional(), // usually filled by controller
    enterpriseId: z.string().min(1), // Required
    budget: z.number().nonnegative(),
    financialTarget: z.record(z.string(), z.any()).optional(),
    description: z.string().min(1).max(2000),
    platformTarget: z
      .array(
        z
          .object({
            platformId: z.string().min(1),
            minFollowers: z.number().nonnegative().optional(),
            maxFollowers: z.number().nonnegative().optional(),
            note: z.string().max(500).optional(),
            extras: z.record(z.string(), z.any()).optional(),
          })
          .strict(),
      )
      .optional()
      .default([]),
    extras: z.record(z.string(), z.any()).optional(),
    schedule: CampaignScheduleSchema.optional(),
  })
  .strict();

export class CampaignCreateInputDto extends createZodDto(
  CampaignCreateInputSchema,
) {}
