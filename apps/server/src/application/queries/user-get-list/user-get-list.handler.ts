import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_READ_SERVICE, type IUserReadService } from '@/application/interfaces';
import { UserDto } from '@/application/dtos';
import { UserGetListQuery } from './user-get-list.query';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

@QueryHandler(UserGetListQuery)
export class UserGetListHandler implements IQueryHandler<UserGetListQuery, PaginatedResponseDto<UserDto>> {
  constructor(
    @Inject(USER_READ_SERVICE)
    private readonly readService: IUserReadService,
  ) {}

  async execute(query: UserGetListQuery): Promise<PaginatedResponseDto<UserDto>> {
    return this.readService.findAll(query.filters);
  }
}
