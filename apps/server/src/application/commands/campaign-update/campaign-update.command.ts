import { CampaignDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { CampaignUpdateInputDto } from './campaign-update.dto';

export class CampaignUpdateCommand extends Command<CampaignDto> {
  constructor(
    public readonly id: string,
    public readonly requestedBy: string,
    public readonly input: CampaignUpdateInputDto,
  ) {
    super();
  }
}
