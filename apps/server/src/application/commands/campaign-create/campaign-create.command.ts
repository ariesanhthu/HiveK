import { Command } from '@nestjs/cqrs';
import { CampaignCreateInputDto } from './campaign-create.dto';
import { CampaignDto } from '@/application/dtos';

export class CampaignCreateCommand extends Command<CampaignDto> {
  constructor(public readonly input: CampaignCreateInputDto) {
    super();
  }
}
