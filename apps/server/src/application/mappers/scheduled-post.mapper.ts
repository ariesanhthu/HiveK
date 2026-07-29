import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostRoot } from '@/core/aggregate-roots';

export class ScheduledPostMapper {
  static toDto(root: ScheduledPostRoot): ScheduledPostDto {
    return {
      id: root.id,
      enterpriseId: root.enterpriseId,
      socialPageId: root.socialPageId,
      campaignId: root.campaignId,
      platformCode: root.platformCode,
      content: root.content,
      mediaFileIds: root.mediaFileIds,
      scheduledAt: root.scheduledAt.toISOString(),
      status: root.status,
      publishedAt: root.publishedAt ? root.publishedAt.toISOString() : null,
      platformPostId: root.platformPostId,
      failReason: root.failReason,
      createdBy: root.createdBy,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };
  }

  static toListDto(roots: ScheduledPostRoot[]): ScheduledPostDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
