import { Query } from '@nestjs/cqrs';
import { UserDto } from '@/application/dtos';

export class AuthGetProfileQuery extends Query<UserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
