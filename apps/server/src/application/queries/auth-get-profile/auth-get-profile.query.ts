import { UserDetailDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class AuthGetProfileQuery extends Query<UserDetailDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
