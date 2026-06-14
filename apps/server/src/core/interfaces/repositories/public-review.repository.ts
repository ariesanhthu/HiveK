import { IBaseRepository } from '../../common/base.repository.interface';
import { PublicReviewRoot } from '../../aggregate-roots/public-review.aggregate';
import { Nullable } from '../../types';

export const PUBLIC_REVIEW_REPOSITORY = Symbol('PUBLIC_REVIEW_REPOSITORY');

export interface IPublicReviewRepository extends IBaseRepository<PublicReviewRoot> {
  findByProposalId(proposalId: string): Promise<PublicReviewRoot[]>;
  findByProposalIdAndStatus(proposalId: string, status: string): Promise<PublicReviewRoot[]>;
}
