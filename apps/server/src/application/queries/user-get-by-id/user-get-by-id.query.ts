import { Query } from '@nestjs/cqrs';
import { UserDetailDto } from '@/application/dtos';

export class UserGetByIdQuery extends Query<UserDetailDto> {
  constructor(public readonly id: string) {
    super();
  }
}
