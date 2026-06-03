import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { USER_READ_SERVICE, type IUserReadService } from '@/application/interfaces';
import { UserDetailDto } from '@/application/dtos';
import { AuthGetProfileQuery } from './auth-get-profile.query';

@QueryHandler(AuthGetProfileQuery)
export class AuthGetProfileHandler implements IQueryHandler<AuthGetProfileQuery, UserDetailDto> {
  constructor(
    @Inject(USER_READ_SERVICE)
    private readonly userReadService: IUserReadService,
  ) {}

  async execute(query: AuthGetProfileQuery): Promise<UserDetailDto> {
    const user = await this.userReadService.findById(query.userId);
    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }
    return user;
  }
}
