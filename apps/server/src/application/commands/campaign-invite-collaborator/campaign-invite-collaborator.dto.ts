import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CampaignInviteCollaboratorInputDtoSchema = z.object({
  userId: z.string(),
});

export class CampaignInviteCollaboratorInputDto extends createZodDto(CampaignInviteCollaboratorInputDtoSchema) {}
