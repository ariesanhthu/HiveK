import { ReviewDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';
import { ReviewFilterDto } from './review-get-list.dto';

export class ReviewGetListQuery extends Query<PaginatedResponseDto<ReviewDto>> {
  constructor(
    public readonly filters: ReviewFilterDto,
  ) {
    super();
  }
}
