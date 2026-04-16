import { Query } from '@nestjs/cqrs';
import { KolProfileDto } from '../dtos';

export class GetKolProfileByIdQuery extends Query<KolProfileDto> {
  constructor(public readonly id: string) {
    super();
  }
}
