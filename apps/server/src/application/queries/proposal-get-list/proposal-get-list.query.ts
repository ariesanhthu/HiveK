import { Query } from '@nestjs/cqrs';
import { ProposalFilterDto } from './proposal-get-list.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { ProposalDto } from '@/application/dtos';

export class ProposalGetListQuery extends Query<PaginatedResponseDto<ProposalDto>> {
  constructor(
    public readonly filters: ProposalFilterDto,
  ) {
    super();
  }
}
