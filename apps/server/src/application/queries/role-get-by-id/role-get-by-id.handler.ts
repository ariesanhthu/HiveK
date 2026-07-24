import { RoleDto } from '@/application/dtos';
import { type IRoleReadService, ROLE_READ_SERVICE } from '@/application/interfaces';
import { RoleNotFoundException } from '@/core/exceptions';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RoleGetByIdQuery } from './role-get-by-id.query';

@QueryHandler(RoleGetByIdQuery)
export class RoleGetByIdQueryHandler implements
  IQueryHandler<
    RoleGetByIdQuery,
    RoleDto
  >
{
  constructor(
    @Inject(ROLE_READ_SERVICE) private readonly readService: IRoleReadService,
  ) {}

  async execute(query: RoleGetByIdQuery): Promise<RoleDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new RoleNotFoundException(query.id);
    }
    return result;
  }
}
