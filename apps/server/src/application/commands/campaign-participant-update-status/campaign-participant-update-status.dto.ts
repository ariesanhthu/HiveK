import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EParticipantStatus } from '@/core/enums';

export const CampaignParticipantUpdateStatusInputSchema = z.object({
  status: z.enum([EParticipantStatus.JOINED, EParticipantStatus.REJECTED]),
}).strict();

export class CampaignParticipantUpdateStatusInputDto extends createZodDto(CampaignParticipantUpdateStatusInputSchema) {}
