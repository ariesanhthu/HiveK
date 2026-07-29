import { Query } from '@nestjs/cqrs';
import { ProposalDto } from '@/application/dtos';

export class ProposalGetByIdQuery extends Query<ProposalDto> {
  constructor(public readonly id: string) {
    super();
  }
}
