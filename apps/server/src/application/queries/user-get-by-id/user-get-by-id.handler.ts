import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_READ_SERVICE, type IUserReadService } from '@/application/interfaces';
import { UserDetailDto } from '@/application/dtos';
import { UserGetByIdQuery } from './user-get-by-id.query';

@QueryHandler(UserGetByIdQuery)
export class UserGetByIdHandler implements IQueryHandler<UserGetByIdQuery, UserDetailDto> {
  constructor(
    @Inject(USER_READ_SERVICE)
    private readonly readService: IUserReadService,
  ) {}

  async execute(query: UserGetByIdQuery): Promise<UserDetailDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new Error('User not found');
    }
    return result;
  }
}
