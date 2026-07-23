import { ProposalDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';
import { ProposalFilterDto } from './proposal-get-list.dto';

export class ProposalGetListQuery extends Query<PaginatedResponseDto<ProposalDto>> {
  constructor(
    public readonly filters: ProposalFilterDto,
  ) {
    super();
  }
}
