import { Query } from '@nestjs/cqrs';
import { UserDetailDto } from '@/application/dtos';

export class AuthGetProfileQuery extends Query<UserDetailDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
