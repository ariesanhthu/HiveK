import { SocialPageDto } from '@/application/dtos';
import { SocialPageRoot } from '@/core/aggregate-roots';

export class SocialPageMapper {
  static toDto(root: SocialPageRoot): SocialPageDto {
    return {
      id: root.id!,
      enterpriseId: root.enterpriseId,
      platformId: root.platformId,
      platformCode: root.platformCode,
      pageId: root.pageId,
      pageName: root.pageName,
      pictureUrl: root.pictureUrl,
      followerCount: root.followerCount,
      webhookVerifyToken: root.webhookVerifyToken,
      isActive: root.isActive,
      createdAt: root.createdAt,
      updatedAt: root.updatedAt,
    };
  }

  static toListDto(roots: SocialPageRoot[]): SocialPageDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
