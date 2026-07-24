import { CampaignDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { CampaignCreateInputDto } from './campaign-create.dto';

export class CampaignCreateCommand extends Command<CampaignDto> {
  constructor(public readonly input: CampaignCreateInputDto) {
    super();
  }
}
