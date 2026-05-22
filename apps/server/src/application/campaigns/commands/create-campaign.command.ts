import { Command } from '@nestjs/cqrs';
import { CreateCampaignInputDto, CampaignDto } from '../dtos';

export class CreateCampaignCommand extends Command<CampaignDto> {
  constructor(public readonly input: CreateCampaignInputDto) {
    super();
  }
}
