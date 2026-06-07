import { Command } from '@nestjs/cqrs';
import { CampaignUpdateInputDto } from './campaign-update.dto';
import { CampaignDto } from '@/application/dtos';

export class CampaignUpdateCommand extends Command<CampaignDto> {
  constructor(
    public readonly id: string,
    public readonly requestedBy: string,
    public readonly input: CampaignUpdateInputDto,
  ) {
    super();
  }
}
