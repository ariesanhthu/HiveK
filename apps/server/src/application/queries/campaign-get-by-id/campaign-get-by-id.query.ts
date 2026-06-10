import { Query } from '@nestjs/cqrs';
import { CampaignDto } from '@/application/dtos';
import { ProjectionDto } from '@/application/dtos/projection.dto';

export class CampaignGetByIdQuery extends Query<CampaignDto> {
  constructor(
    public readonly id: string,
    public readonly projection?: ProjectionDto,
  ) {
    super();
  }
}
