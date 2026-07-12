import { ScheduledPostDto } from '@/application/dtos';
import { ScheduledPostRoot } from '@/core/aggregate-roots';

export class ScheduledPostMapper {
  static toDto(root: ScheduledPostRoot): ScheduledPostDto {
    return {
      id: root.id!,
      enterpriseId: root.enterpriseId,
      socialPageId: root.socialPageId,
      platformCode: root.platformCode,
      content: root.content,
      mediaFileIds: root.mediaFileIds,
      scheduledAt: root.scheduledAt,
      status: root.status,
      publishedAt: root.publishedAt,
      platformPostId: root.platformPostId,
      failReason: root.failReason,
      createdBy: root.createdBy,
      createdAt: root.createdAt,
      updatedAt: root.updatedAt,
    };
  }

  static toListDto(roots: ScheduledPostRoot[]): ScheduledPostDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
