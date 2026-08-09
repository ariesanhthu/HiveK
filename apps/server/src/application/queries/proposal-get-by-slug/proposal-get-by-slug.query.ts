import { Query } from '@nestjs/cqrs';
import { ProposalDto } from '@/application/dtos';

export class ProposalGetBySlugQuery extends Query<ProposalDto> {
  constructor(public readonly slug: string) {
    super();
  }
}
