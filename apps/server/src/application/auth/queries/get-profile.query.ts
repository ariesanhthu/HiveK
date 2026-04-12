import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { USER_READ_SERVICE, type IUserReadService } from '@/application/interfaces';
import { UserDto } from '@/application/users/dtos';

export class GetProfileQuery extends Query<UserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetProfileQuery)
export class GetProfileQueryHandler implements IQueryHandler<GetProfileQuery> {
  constructor(
    @Inject(USER_READ_SERVICE)
    private readonly userReadService: IUserReadService,
  ) {}

  async execute(query: GetProfileQuery): Promise<UserDto> {
    const user = await this.userReadService.findById(query.userId);
    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }
    return user;
  }
}
