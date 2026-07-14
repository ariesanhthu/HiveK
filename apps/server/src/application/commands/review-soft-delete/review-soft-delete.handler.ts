import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PUBLIC_REVIEW_REPOSITORY,
  type IPublicReviewRepository,
} from '@/core/interfaces/repositories';
import { ReviewNotFoundException } from '@/core/exceptions';
import { ReviewSoftDeleteCommand } from './review-soft-delete.command';

@CommandHandler(ReviewSoftDeleteCommand)
export class ReviewSoftDeleteCommandHandler implements ICommandHandler<
  ReviewSoftDeleteCommand,
  void
> {
  constructor(
    @Inject(PUBLIC_REVIEW_REPOSITORY)
    private readonly reviewRepository: IPublicReviewRepository,
  ) {}

  async execute(command: ReviewSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new ReviewNotFoundException(id);
    }

    review.softDelete(deletedBy);
    await this.reviewRepository.save(review);
  }
}
