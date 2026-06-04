import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EParticipantStatus, EOutputType } from '@/core/enums';

export const CampaignOutputInputSchema = z.object({
  id: z.string().optional(),
  platformId: z.string().optional(),
  outputType: z.enum(EOutputType),
  title: z.string(),
  isScheduleForPost: z.boolean(),
  scheduledAt: z.string().datetime().nullable().optional(),
  url: z.string().url().nullable().optional(),
});

export const CampaignParticipantUpdateInputSchema = z.object({
  status: z.enum(EParticipantStatus).optional(),
  outputs: z.array(CampaignOutputInputSchema).optional(),
});

export class CampaignParticipantUpdateInputDto extends createZodDto(CampaignParticipantUpdateInputSchema) {}
