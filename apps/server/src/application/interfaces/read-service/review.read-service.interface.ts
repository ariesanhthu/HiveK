import { IBaseReadService } from './base.read-service.interface';
import { ReviewDto, ReviewFilterDto } from '@/application/dtos';
import { Nullable } from '@/core/types';

export const PUBLIC_REVIEW_READ_SERVICE = Symbol('PUBLIC_REVIEW_READ_SERVICE');

export interface IPublicReviewReadService extends IBaseReadService<ReviewDto, ReviewFilterDto> {
  findByProposalId(proposalId: string): Promise<ReviewDto[]>;
}
