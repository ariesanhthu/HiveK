import { CampaignDto } from '@/application/dtos';
import { CampaignRoot } from '@/core/aggregate-roots';

export class CampaignMapper {
  static toDto(root: CampaignRoot): CampaignDto {
    return {
      id: root.id!,
      ownerId: root.ownerId,
      enterpriseId: root.enterpriseId,
      budget: root.budget,
      financialTarget: root.financialTarget,
      description: root.description,
      platformTarget: root.platformTarget.map((item) => ({
        platformId: item.platformId,
        minFollowers: item.minFollowers,
        maxFollowers: item.maxFollowers,
        note: item.note,
        extras: item.extras,
      })),
      status: root.status,
      collaboratorIds: root.collaboratorIds,
      rawContents: root.rawContents.map((r) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
      })),
      extras: root.extras,
      schedule: root.schedule ? {
        timeline: root.schedule.timeline.map((day) => ({
          date: day.date.toISOString(),
          label: day.label,
          posts: day.posts,  // ScheduledPost IDs
        })),
      } : undefined,
      participants: root.participants.map((p) => ({
        id: p.id!,
        kolProfileId: p.kolProfileId,
        status: p.status,
        joinedAt: p.joinedAt ? p.joinedAt.toISOString() : null,
      })),
    };
  }

  static toListDto(roots: CampaignRoot[]): CampaignDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
