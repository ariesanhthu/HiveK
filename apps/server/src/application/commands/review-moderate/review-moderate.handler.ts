import { ReviewInvalidStatusTransitionException, ReviewNotFoundException } from '@/core/exceptions';
import {
  type IPublicReviewRepository,
  PUBLIC_REVIEW_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReviewModerateCommand } from './review-moderate.command';

@CommandHandler(ReviewModerateCommand)
export class ReviewModerateCommandHandler implements
  ICommandHandler<
    ReviewModerateCommand,
    void
  >
{
  constructor(
    @Inject(PUBLIC_REVIEW_REPOSITORY) private readonly reviewRepository: IPublicReviewRepository,
  ) {}

  async execute(command: ReviewModerateCommand): Promise<void> {
    const { id, action } = command;

    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new ReviewNotFoundException(id);
    }

    try {
      if (action === 'approve') {
        review.approve();
      } else {
        review.reject();
      }
    } catch (error) {
      throw new ReviewInvalidStatusTransitionException(
        error instanceof Error ? error.message : String(error),
      );
    }

    await this.reviewRepository.save(review);
  }
}
