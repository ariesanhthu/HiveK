import { Query } from '@nestjs/cqrs';
import { ReviewFilterDto } from './review-get-list.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { ReviewDto } from '@/application/dtos';

export class ReviewGetListQuery extends Query<PaginatedResponseDto<ReviewDto>> {
  constructor(public readonly filters: ReviewFilterDto) {
    super();
  }
}
