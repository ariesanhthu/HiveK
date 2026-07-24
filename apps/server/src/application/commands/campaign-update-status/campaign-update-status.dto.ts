import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CampaignUpdateStatusInputDtoSchema = z
  .object({
    status: z.enum(ECampaignStatus),
  })
  .strict();

export class CampaignUpdateStatusInputDto extends createZodDto(
  CampaignUpdateStatusInputDtoSchema,
) {}
