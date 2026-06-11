import { Command } from '@nestjs/cqrs';
import { CampaignParticipantUpdateStatusInputDto } from './campaign-participant-update-status.dto';

export class CampaignParticipantUpdateStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly input: CampaignParticipantUpdateStatusInputDto,
  ) {
    super();
  }
}
