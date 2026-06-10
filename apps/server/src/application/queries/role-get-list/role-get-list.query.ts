import { Query } from '@nestjs/cqrs';
import { RoleFilterDto, RoleDto } from '../../dtos/role.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class RoleGetListQuery extends Query<PaginatedResponseDto<RoleDto>> {
  constructor(public readonly filters?: RoleFilterDto) {
    super();
  }
}
