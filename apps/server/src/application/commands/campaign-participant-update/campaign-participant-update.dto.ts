import { EOutputType, EParticipantStatus } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CampaignOutputInputSchema = z.object({
  id: z.string().optional(),
  platformId: z.string().optional(),
  outputType: z.enum(EOutputType),
  title: z.string(),
  isScheduleForPost: z.boolean(),
  scheduledAt: z.string().datetime().nullable().optional(),
  url: z.string().url().nullable().optional(),
}).strict();

export const CampaignParticipantUpdateInputSchema = z.object({
  status: z.enum(EParticipantStatus).optional(),
  outputs: z.array(CampaignOutputInputSchema).optional(),
}).strict();

export class CampaignParticipantUpdateInputDto
  extends createZodDto(CampaignParticipantUpdateInputSchema)
{}
