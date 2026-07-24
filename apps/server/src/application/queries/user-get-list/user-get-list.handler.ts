import { UserDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { type IUserReadService, USER_READ_SERVICE } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserGetListQuery } from './user-get-list.query';

@QueryHandler(UserGetListQuery)
export class UserGetListHandler implements
  IQueryHandler<
    UserGetListQuery,
    PaginatedResponseDto<UserDetailDto>
  >
{
  constructor(
    @Inject(USER_READ_SERVICE) private readonly readService: IUserReadService,
  ) {}

  async execute(
    query: UserGetListQuery,
  ): Promise<PaginatedResponseDto<UserDetailDto>> {
    return this.readService.findAll(query.filters);
  }
}
