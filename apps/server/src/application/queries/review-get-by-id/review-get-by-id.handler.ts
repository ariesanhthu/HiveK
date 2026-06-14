import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReviewNotFoundException } from '@/core/exceptions';
import { PUBLIC_REVIEW_READ_SERVICE, type IPublicReviewReadService } from '@/application/interfaces/read-service/review.read-service.interface';
import { ReviewDto } from '@/application/dtos';
import { ReviewGetByIdQuery } from './review-get-by-id.query';

@QueryHandler(ReviewGetByIdQuery)
export class ReviewGetByIdHandler implements IQueryHandler<ReviewGetByIdQuery, ReviewDto> {
  constructor(
    @Inject(PUBLIC_REVIEW_READ_SERVICE)
    private readonly reviewReadService: IPublicReviewReadService,
  ) {}

  async execute(query: ReviewGetByIdQuery): Promise<ReviewDto> {
    const review = await this.reviewReadService.findById(query.id);
    if (!review) {
      throw new ReviewNotFoundException(query.id);
    }
    return review;
  }
}
