import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ROLE_READ_SERVICE, type IRoleReadService } from '@/application/interfaces';
import { RoleDto } from '@/application/dtos';
import { RoleGetByIdQuery } from './role-get-by-id.query';

@QueryHandler(RoleGetByIdQuery)
export class RoleGetByIdQueryHandler implements IQueryHandler<RoleGetByIdQuery, RoleDto> {
  constructor(
    @Inject(ROLE_READ_SERVICE)
    private readonly readService: IRoleReadService,
  ) {}

  async execute(query: RoleGetByIdQuery): Promise<RoleDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new NotFoundException(`Role with ID ${query.id} not found`);
    }
    return result;
  }
}
