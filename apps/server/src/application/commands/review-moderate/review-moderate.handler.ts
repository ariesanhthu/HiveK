import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PUBLIC_REVIEW_REPOSITORY, type IPublicReviewRepository } from '@/core/interfaces/repositories';
import { ReviewNotFoundException, ReviewInvalidStatusTransitionException } from '@/core/exceptions';
import { ReviewModerateCommand } from './review-moderate.command';

@CommandHandler(ReviewModerateCommand)
export class ReviewModerateCommandHandler implements ICommandHandler<ReviewModerateCommand, void> {
  constructor(
    @Inject(PUBLIC_REVIEW_REPOSITORY)
    private readonly reviewRepository: IPublicReviewRepository,
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
    } catch (error: any) {
      throw new ReviewInvalidStatusTransitionException(error.message);
    }

    await this.reviewRepository.save(review);
  }
}
