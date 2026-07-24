import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CampaignRevokeCollaboratorInputDtoSchema = z
  .object({
    memberIds: z.array(z.string()).min(1),
  })
  .strict();

export class CampaignRevokeCollaboratorInputDto extends createZodDto(
  CampaignRevokeCollaboratorInputDtoSchema,
) {}
