import { Query } from '@nestjs/cqrs';
import { CampaignDto } from '@/application/dtos';

export class CampaignGetByIdQuery extends Query<CampaignDto> {
  constructor(public readonly id: string) {
    super();
  }
}
