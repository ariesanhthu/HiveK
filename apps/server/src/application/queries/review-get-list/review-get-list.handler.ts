import { ReviewDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  type IPublicReviewReadService,
  PUBLIC_REVIEW_READ_SERVICE,
} from '@/application/interfaces/read-service/review.read-service.interface';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ReviewGetListQuery } from './review-get-list.query';

@QueryHandler(ReviewGetListQuery)
export class ReviewGetListHandler
  implements IQueryHandler<ReviewGetListQuery, PaginatedResponseDto<ReviewDto>>
{
  constructor(
    @Inject(PUBLIC_REVIEW_READ_SERVICE) private readonly reviewReadService:
      IPublicReviewReadService,
  ) {}

  async execute(query: ReviewGetListQuery): Promise<PaginatedResponseDto<ReviewDto>> {
    return this.reviewReadService.findAll(query.filters);
  }
}
