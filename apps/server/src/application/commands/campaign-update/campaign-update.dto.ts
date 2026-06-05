import { CampaignDtoSchema } from '@/application/dtos/campaign.dto';
import { createZodDto } from 'nestjs-zod';

export const CampaignUpdateInputDtoSchema = CampaignDtoSchema.omit({
  id: true,
  status: true,
  collaboratorIds: true,
  rawContents: true,
}).partial();
export class CampaignUpdateInputDto extends createZodDto(CampaignUpdateInputDtoSchema) {}
