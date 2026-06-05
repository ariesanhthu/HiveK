import { CampaignDtoSchema } from '@/application/dtos/campaign.dto';
import { createZodDto } from 'nestjs-zod';

export const CampaignCreateInputDtoSchema = CampaignDtoSchema.omit({
  id: true,
  status: true,
  collaboratorIds: true,
  rawContents: true,
});
export class CampaignCreateInputDto extends createZodDto(CampaignCreateInputDtoSchema) {}
