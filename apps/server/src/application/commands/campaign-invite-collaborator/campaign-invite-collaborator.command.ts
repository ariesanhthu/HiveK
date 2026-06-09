import { CampaignInviteCollaboratorInputDto } from '@/application';
import { Command } from '@nestjs/cqrs';

export class CampaignInviteCollaboratorCommand extends Command<void> {
  constructor(
    public readonly campaignId: string,
    public readonly dto: CampaignInviteCollaboratorInputDto,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
