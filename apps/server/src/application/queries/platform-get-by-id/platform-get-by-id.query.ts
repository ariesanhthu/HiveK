import { PlatformDetailDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class PlatformGetByIdQuery extends Query<PlatformDetailDto> {
  constructor(public readonly id: string) {
    super();
  }
}
