import { EParticipantStatus } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CampaignParticipantUpdateStatusInputSchema = z.object({
  status: z.enum([EParticipantStatus.JOINED, EParticipantStatus.REJECTED]),
}).strict();

export class CampaignParticipantUpdateStatusInputDto
  extends createZodDto(CampaignParticipantUpdateStatusInputSchema)
{}
