import { KolProfileDto, ProjectionDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class KolProfileGetByIdQuery extends Query<KolProfileDto> {
  constructor(
    public readonly id: string,
    public readonly projection?: ProjectionDto,
  ) {
    super();
  }
}
