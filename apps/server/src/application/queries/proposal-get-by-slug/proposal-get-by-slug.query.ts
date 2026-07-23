import { ProposalDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class ProposalGetBySlugQuery extends Query<ProposalDto> {
  constructor(
    public readonly slug: string,
  ) {
    super();
  }
}
