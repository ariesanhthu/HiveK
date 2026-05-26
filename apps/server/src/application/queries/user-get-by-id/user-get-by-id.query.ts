import { Query } from '@nestjs/cqrs';
import { UserDto } from '@/application/dtos';

export class UserGetByIdQuery extends Query<UserDto> {
  constructor(public readonly id: string) {
    super();
  }
}
