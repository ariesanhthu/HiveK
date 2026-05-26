import { Query } from '@nestjs/cqrs';
import { PlatformDto } from '@/application/dtos';

export class PlatformGetByIdQuery extends Query<PlatformDto> {
  constructor(public readonly id: string) {
    super();
  }
}
