import { Query } from '@nestjs/cqrs';
import { UserFilterDto, UserDto } from '../../dtos/user.dto';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class UserGetListQuery extends Query<PaginatedResponseDto<UserDto>> {
  constructor(public readonly filters?: UserFilterDto) {
    super();
  }
}
