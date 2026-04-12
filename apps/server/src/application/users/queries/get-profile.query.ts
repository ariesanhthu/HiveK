import { Query } from '@nestjs/cqrs';
import { UserDto } from '../dtos';

export class GetProfileQuery extends Query<UserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
