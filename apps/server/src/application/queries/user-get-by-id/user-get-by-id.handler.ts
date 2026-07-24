import { UserDetailDto } from '@/application/dtos';
import { type IUserReadService, USER_READ_SERVICE } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserGetByIdQuery } from './user-get-by-id.query';

import { UserNotFoundException } from '@/core/exceptions';

@QueryHandler(UserGetByIdQuery)
export class UserGetByIdHandler implements
  IQueryHandler<
    UserGetByIdQuery,
    UserDetailDto
  >
{
  constructor(
    @Inject(USER_READ_SERVICE) private readonly readService: IUserReadService,
  ) {}

  async execute(query: UserGetByIdQuery): Promise<UserDetailDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new UserNotFoundException(query.id);
    }
    return result;
  }
}
