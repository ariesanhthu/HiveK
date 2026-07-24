import { CampaignParticipantDto } from '@/application/dtos';
import { ProjectionDto } from '@/application/dtos/projection.dto';
import { Query } from '@nestjs/cqrs';

export class CampaignParticipantGetByIdQuery extends Query<CampaignParticipantDto | null> {
  constructor(
    public readonly id: string,
    public readonly projection?: ProjectionDto,
  ) {
    super();
  }
}
