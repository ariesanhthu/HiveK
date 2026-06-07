import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CampaignCreateInputSchema } from '../campaign-create/campaign-create.dto';

export const CampaignUpdateInputSchema = CampaignCreateInputSchema.partial();

export class CampaignUpdateInputDto extends createZodDto(CampaignUpdateInputSchema) {}
