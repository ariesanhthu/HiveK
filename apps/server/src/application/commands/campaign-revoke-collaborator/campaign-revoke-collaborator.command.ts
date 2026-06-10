import { Command } from '@nestjs/cqrs';
import { CampaignRevokeCollaboratorInputDto } from './campaign-revoke-collaborator.dto';

export class CampaignRevokeCollaboratorCommand extends Command<void> {
  constructor(
    public readonly campaignId: string,
    public readonly dto: CampaignRevokeCollaboratorInputDto,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
