import { Command } from '@nestjs/cqrs';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

export class CampaignUpdateStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly requestedBy: string,
    public readonly status: ECampaignStatus,
  ) {
    super();
  }
}
