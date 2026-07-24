import { RoleDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { type IRoleReadService, ROLE_READ_SERVICE } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RoleGetListQuery } from './role-get-list.query';

@QueryHandler(RoleGetListQuery)
export class RoleGetListQueryHandler implements
  IQueryHandler<
    RoleGetListQuery,
    PaginatedResponseDto<RoleDto>
  >
{
  constructor(
    @Inject(ROLE_READ_SERVICE) private readonly readService: IRoleReadService,
  ) {}

  async execute(
    query: RoleGetListQuery,
  ): Promise<PaginatedResponseDto<RoleDto>> {
    return this.readService.findAll(query.filters);
  }
}
