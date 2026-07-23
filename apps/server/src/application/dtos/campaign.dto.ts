import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EnterpriseDto } from './enterprise.dto';
import { UserDto } from './user.dto';

export const PlatformTargetItemDtoSchema = z.object({
  platformId: z.string(),
  minFollowers: z.number().optional(),
  maxFollowers: z.number().optional(),
  note: z.string().optional(),
  others: z.record(z.string(), z.any()).optional(),
}).strict();

export const RawContentItemDtoSchema = z.object({
  fileId: z.string(),
  rawContent: z.string().optional(),
}).strict();

export const CampaignParticipantSubDtoSchema = z.object({
  id: z.string(),
  kolProfileId: z.string(),
  status: z.string(),
  joinedAt: z.any().nullable(),
}).strict();

export const CampaignKOLOutputDtoSchema = z.object({
  id: z.string(),
  campaignParticipantId: z.string(),
  platformId: z.string(),
  uniqueId: z.string().nullable().optional(),
  outputType: z.string(),
  title: z.string(),
  isScheduleForPost: z.boolean(),
  scheduledAt: z.any().nullable(),
  fileId: z.string().nullable(),
  status: z.string(),
  url: z.string().nullable(),
  postedAt: z.any().nullable(),
  isTrackingActive: z.boolean(),
}).strict();

export const CampaignEnterpriseOutputDtoSchema = z.object({
  id: z.string(),
  platformId: z.string(),
  uniqueId: z.string().nullable().optional(),
  outputType: z.string(),
  title: z.string(),
  isScheduleForPost: z.boolean(),
  scheduledAt: z.any().nullable(),
  fileId: z.string().nullable(),
  status: z.string(),
  url: z.string().nullable(),
  postedAt: z.any().nullable(),
  isTrackingActive: z.boolean(),
}).strict();

export const SchedulePostDtoSchema = z.object({
  scheduledTime: z.any(),
  platformId: z.string(),
  status: z.string(),
  campaignKOLOutputs: z.array(CampaignKOLOutputDtoSchema).optional().default([]),
  campaignEnterpriseOutputs: z.array(CampaignEnterpriseOutputDtoSchema).optional().default([]),
}).strict();

export const ScheduleDayDtoSchema = z.object({
  date: z.any(),
  label: z.string().optional(),
  posts: z.array(SchedulePostDtoSchema),
}).strict();

export const CampaignScheduleDtoSchema = z.object({
  timeline: z.array(ScheduleDayDtoSchema),
}).strict();

export const CampaignDtoSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  enterpriseId: z.string().nullable(),
  budget: z.number(),
  financialTarget: z.record(z.string(), z.any()),
  description: z.string(),
  platformTarget: z.array(PlatformTargetItemDtoSchema),
  status: z.enum(ECampaignStatus),
  collaboratorIds: z.array(z.string()),
  rawContents: z.array(RawContentItemDtoSchema),
  schedule: CampaignScheduleDtoSchema.optional(),
  participants: z.array(CampaignParticipantSubDtoSchema).optional().default([]),
}).strict();

export class CampaignDto extends createZodDto(CampaignDtoSchema) {}

export class CampaignDetailDto extends CampaignDto {
  owner?: UserDto;
  enterprise?: EnterpriseDto;
  collaborators?: UserDto[];
}
