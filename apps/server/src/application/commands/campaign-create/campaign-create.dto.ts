import { CampaignDtoSchema } from '@/application/dtos/campaign.dto';
import { createZodDto } from 'nestjs-zod';

export const CampaignCreateInputDtoSchema = CampaignDtoSchema.omit({ id: true });
export class CampaignCreateInputDto extends createZodDto(CampaignCreateInputDtoSchema) {}
