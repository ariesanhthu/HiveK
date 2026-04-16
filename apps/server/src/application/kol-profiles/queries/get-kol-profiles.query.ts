import { Query } from '@nestjs/cqrs';
import { KolProfileDto } from '../dtos';
import { JsonRecord } from '@/shared/types';

export class GetKolProfilesQuery extends Query<KolProfileDto[]> {
  constructor(public readonly filters?: JsonRecord) {
    super();
  }
}
