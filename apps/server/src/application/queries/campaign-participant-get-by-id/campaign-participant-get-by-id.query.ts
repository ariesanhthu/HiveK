import { Query } from '@nestjs/cqrs';
import { CampaignParticipantDto } from '@/application/dtos';

export class CampaignParticipantGetByIdQuery extends Query<CampaignParticipantDto | null> {
  constructor(public readonly id: string) {
    super();
  }
}
