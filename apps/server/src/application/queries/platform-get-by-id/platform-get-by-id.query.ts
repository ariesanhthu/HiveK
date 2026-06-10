import { Query } from '@nestjs/cqrs';
import { PlatformDetailDto } from '@/application/dtos';

export class PlatformGetByIdQuery extends Query<PlatformDetailDto> {
  constructor(public readonly id: string) {
    super();
  }
}
