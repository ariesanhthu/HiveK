import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PUBLIC_REVIEW_REPOSITORY, type IPublicReviewRepository } from '@/core/interfaces/repositories';
import { ReviewNotFoundException } from '@/core/exceptions';
import { ReviewRestoreCommand } from './review-restore.command';

@CommandHandler(ReviewRestoreCommand)
export class ReviewRestoreCommandHandler implements ICommandHandler<ReviewRestoreCommand, void> {
  constructor(
    @Inject(PUBLIC_REVIEW_REPOSITORY)
    private readonly reviewRepository: IPublicReviewRepository,
  ) {}

  async execute(command: ReviewRestoreCommand): Promise<void> {
    const { id } = command;

    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new ReviewNotFoundException(id);
    }

    review.restore();
    await this.reviewRepository.save(review);
  }
}
