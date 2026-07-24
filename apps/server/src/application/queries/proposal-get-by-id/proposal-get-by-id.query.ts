import { ProposalDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class ProposalGetByIdQuery extends Query<ProposalDto> {
  constructor(public readonly id: string) {
    super();
  }
}
