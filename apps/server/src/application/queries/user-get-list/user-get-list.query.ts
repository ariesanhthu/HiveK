import { Query } from '@nestjs/cqrs';
import { UserFilterDto, UserDetailDto } from '../../dtos/user.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class UserGetListQuery extends Query<
  PaginatedResponseDto<UserDetailDto>
> {
  constructor(public readonly filters?: UserFilterDto) {
    super();
  }
}
