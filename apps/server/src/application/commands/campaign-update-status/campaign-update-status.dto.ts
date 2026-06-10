import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

export const CampaignUpdateStatusInputDtoSchema = z.object({
  status: z.nativeEnum(ECampaignStatus),
});

export class CampaignUpdateStatusInputDto extends createZodDto(CampaignUpdateStatusInputDtoSchema) {}
