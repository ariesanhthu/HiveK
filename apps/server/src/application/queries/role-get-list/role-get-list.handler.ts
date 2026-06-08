import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ROLE_READ_SERVICE, type IRoleReadService } from '@/application/interfaces';
import { RoleDto } from '@/application/dtos';
import { RoleGetListQuery } from './role-get-list.query';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@QueryHandler(RoleGetListQuery)
export class RoleGetListQueryHandler implements IQueryHandler<RoleGetListQuery, PaginatedResponseDto<RoleDto>> {
  constructor(
    @Inject(ROLE_READ_SERVICE)
    private readonly readService: IRoleReadService,
  ) {}

  async execute(query: RoleGetListQuery): Promise<PaginatedResponseDto<RoleDto>> {
    return this.readService.findAll(query.filters);
  }
}
