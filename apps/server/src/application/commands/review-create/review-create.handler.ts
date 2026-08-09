import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PUBLIC_REVIEW_REPOSITORY,
  type IPublicReviewRepository,
} from '@/core/interfaces/repositories';
import {
  CAMPAIGN_PROPOSAL_REPOSITORY,
  type ICampaignProposalRepository,
} from '@/core/interfaces/repositories';
import { PublicReviewRoot } from '@/core/aggregate-roots';
import { ReviewSecurityMetadataVO } from '@/core/value-objects';
import {
  ReviewLowRecaptchaScoreException,
  ProposalNotFoundException,
} from '@/core/exceptions';
import { ReviewCreateCommand } from './review-create.command';
import { ReviewDto } from '@/application/dtos';
import { ReviewMapper } from '@/application/mappers';

@CommandHandler(ReviewCreateCommand)
export class ReviewCreateCommandHandler implements ICommandHandler<
  ReviewCreateCommand,
  ReviewDto
> {
  constructor(
    @Inject(PUBLIC_REVIEW_REPOSITORY)
    private readonly reviewRepository: IPublicReviewRepository,
    @Inject(CAMPAIGN_PROPOSAL_REPOSITORY)
    private readonly proposalRepository: ICampaignProposalRepository,
  ) {}

  async execute(command: ReviewCreateCommand): Promise<ReviewDto> {
    const { input } = command;

    const proposal = await this.proposalRepository.findById(input.proposalId);
    if (!proposal) {
      throw new ProposalNotFoundException(input.proposalId);
    }

    const securityMetadata = ReviewSecurityMetadataVO.create({
      ipHash: input.securityMetadata.ipHash,
      browserFingerprint: input.securityMetadata.browserFingerprint,
      recaptchaScore: input.securityMetadata.recaptchaScore,
    });

    if (!securityMetadata.isRecaptchaValid(0.5)) {
      throw new ReviewLowRecaptchaScoreException(
        input.securityMetadata.recaptchaScore,
      );
    }

    const review = PublicReviewRoot.create({
      proposalId: input.proposalId,
      authorName: input.authorName,
      rating: input.rating,
      comment: input.comment,
      securityMetadata,
    });

    await this.reviewRepository.save(review);

    return ReviewMapper.toDto(review);
  }
}
