import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CampaignRevokeCollaboratorInputDtoSchema = z.object({
  memberIds: z.array(z.string()).min(1),
}).strict();

export class CampaignRevokeCollaboratorInputDto extends createZodDto(CampaignRevokeCollaboratorInputDtoSchema) {}
