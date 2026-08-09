import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PUBLIC_REVIEW_READ_SERVICE,
  type IPublicReviewReadService,
} from '@/application/interfaces/read-service/review.read-service.interface';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { ReviewDto } from '@/application/dtos';
import { ReviewGetListQuery } from './review-get-list.query';

@QueryHandler(ReviewGetListQuery)
export class ReviewGetListHandler implements IQueryHandler<
  ReviewGetListQuery,
  PaginatedResponseDto<ReviewDto>
> {
  constructor(
    @Inject(PUBLIC_REVIEW_READ_SERVICE)
    private readonly reviewReadService: IPublicReviewReadService,
  ) {}

  async execute(
    query: ReviewGetListQuery,
  ): Promise<PaginatedResponseDto<ReviewDto>> {
    return this.reviewReadService.findAll(query.filters);
  }
}
