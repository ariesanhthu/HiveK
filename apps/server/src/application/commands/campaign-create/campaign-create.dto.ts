import { EOutputStatus, EOutputType, ESchedulePostStatus } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

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

export const SchedulePostSchema = z
  .object({
    scheduledTime: z.iso.datetime(),
    platformId: z.string().min(1),
    status: z
      .enum(ESchedulePostStatus)
      .optional()
      .default(ESchedulePostStatus.DRAFT),
    campaignKOLOutputs: z
      .array(CampaignKOLOutputInputSchema)
      .optional()
      .default([]),
    campaignEnterpriseOutputs: z
      .array(CampaignEnterpriseOutputInputSchema)
      .optional()
      .default([]),
  })
  .strict();

export const ScheduleDaySchema = z
  .object({
    date: z.iso.datetime(),
    label: z.string().max(200).optional(),
    posts: z.array(SchedulePostSchema),
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
            others: z.record(z.string(), z.any()).optional(),
          })
          .strict(),
      )
      .optional()
      .default([]),
    schedule: CampaignScheduleSchema.optional(),
  })
  .strict();

export class CampaignCreateInputDto extends createZodDto(
  CampaignCreateInputSchema,
) {}
