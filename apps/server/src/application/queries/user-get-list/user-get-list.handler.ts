import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_READ_SERVICE, type IUserReadService } from '@/application/interfaces';
import { UserDetailDto } from '@/application/dtos';
import { UserGetListQuery } from './user-get-list.query';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@QueryHandler(UserGetListQuery)
export class UserGetListHandler implements IQueryHandler<UserGetListQuery, PaginatedResponseDto<UserDetailDto>> {
  constructor(
    @Inject(USER_READ_SERVICE)
    private readonly readService: IUserReadService,
  ) {}

  async execute(query: UserGetListQuery): Promise<PaginatedResponseDto<UserDetailDto>> {
    return this.readService.findAll(query.filters);
  }
}
