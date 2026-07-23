import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';
import { RoleDto, RoleFilterDto } from '../../dtos/role.dto';

export class RoleGetListQuery extends Query<PaginatedResponseDto<RoleDto>> {
  constructor(public readonly filters?: RoleFilterDto) {
    super();
  }
}
