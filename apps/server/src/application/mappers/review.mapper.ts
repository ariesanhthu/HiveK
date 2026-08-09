import { ReviewDto } from '@/application/dtos';
import { PublicReviewRoot } from '@/core/aggregate-roots';

export class ReviewMapper {
  static toDto(root: PublicReviewRoot): ReviewDto {
    return {
      id: root.id,
      proposalId: root.proposalId,
      authorName: root.authorName,
      rating: root.rating,
      comment: root.comment,
      status: root.status,
      createdAt: root.createdAt.toISOString(),
    };
  }

  static toListDto(roots: PublicReviewRoot[]): ReviewDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
