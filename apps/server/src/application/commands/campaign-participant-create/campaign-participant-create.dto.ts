import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CampaignParticipantCreateInputSchema = z
  .object({
    campaignId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
    kolProfileId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  })
  .strict();

export class CampaignParticipantCreateInputDto extends createZodDto(
  CampaignParticipantCreateInputSchema,
) {}
