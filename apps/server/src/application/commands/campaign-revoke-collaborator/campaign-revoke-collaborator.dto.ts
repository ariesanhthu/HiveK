import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CampaignRevokeCollaboratorInputDtoSchema = z.object({
  userId: z.string(),
});

export class CampaignRevokeCollaboratorInputDto extends createZodDto(CampaignRevokeCollaboratorInputDtoSchema) {}
