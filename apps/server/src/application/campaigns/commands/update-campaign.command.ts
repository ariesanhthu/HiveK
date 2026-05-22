import { Command } from '@nestjs/cqrs';
import { CampaignDto, UpdateCampaignInputDto } from '../dtos';

export class UpdateCampaignCommand extends Command<CampaignDto> {
  constructor(
    public readonly id: string,
    public readonly input: UpdateCampaignInputDto,
  ) {
    super();
  }
}
