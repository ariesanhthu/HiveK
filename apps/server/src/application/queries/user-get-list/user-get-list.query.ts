import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';
import { UserDetailDto, UserFilterDto } from '../../dtos/user.dto';

export class UserGetListQuery extends Query<
  PaginatedResponseDto<UserDetailDto>
> {
  constructor(public readonly filters?: UserFilterDto) {
    super();
  }
}
