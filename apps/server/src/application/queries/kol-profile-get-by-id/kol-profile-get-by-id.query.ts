import { Query } from '@nestjs/cqrs';
import { KolProfileDto, ProjectionDto } from '@/application/dtos';

export class KolProfileGetByIdQuery extends Query<KolProfileDto> {
  constructor(
    public readonly id: string,
    public readonly projection?: ProjectionDto,
  ) {
    super();
  }
}
