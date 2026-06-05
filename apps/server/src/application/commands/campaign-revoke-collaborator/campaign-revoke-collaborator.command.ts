import { Command } from '@nestjs/cqrs';

export class CampaignRevokeCollaboratorCommand extends Command<void> {
  constructor(
    public readonly campaignId: string,
    public readonly userId: string,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
