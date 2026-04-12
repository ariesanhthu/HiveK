import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_READ_SERVICE, type IUserReadService } from '@/application/interfaces';
import { UserDto } from '../dtos';

export class GetUserQuery extends Query<UserDto> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_READ_SERVICE)
    private readonly readService: IUserReadService,
  ) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    const result = await this.readService.findById(query.id);
    if (!result) {
      throw new Error('User not found');
    }
    return result;
  }
}
