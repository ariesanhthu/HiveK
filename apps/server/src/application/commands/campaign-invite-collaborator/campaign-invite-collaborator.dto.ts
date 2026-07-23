import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CampaignInviteCollaboratorInputDtoSchema = z.object({
  memberIds: z.array(z.string()).min(1),
}).strict();

export class CampaignInviteCollaboratorInputDto
  extends createZodDto(CampaignInviteCollaboratorInputDtoSchema)
{}
