import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CampaignInviteCollaboratorInputDtoSchema = z
  .object({
    memberIds: z.array(z.string()).min(1),
  })
  .strict();

export class CampaignInviteCollaboratorInputDto extends createZodDto(
  CampaignInviteCollaboratorInputDtoSchema,
) {}
