import { UserDetailDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class UserGetByIdQuery extends Query<UserDetailDto> {
  constructor(public readonly id: string) {
    super();
  }
}
