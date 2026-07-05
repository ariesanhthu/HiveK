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
        others: item.others,
      })),
      status: root.status,
      collaboratorIds: root.collaboratorIds,
      rawContents: root.rawContents.map((r) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
      })),
      schedule: root.schedule ? {
        timeline: root.schedule.timeline.map((day) => ({
          date: day.date,
          label: day.label,
          posts: day.posts.map((post) => ({
            scheduledTime: post.scheduledTime,
            platformId: post.platformId,
            status: post.status,
            campaignKOLOutputs: post.campaignKOLOutputs.map((o) => ({
              id: o.id!,
              campaignParticipantId: o.campaignParticipantId,
              platformId: o.platformId,
              uniqueId: o.uniqueId || null,
              outputType: o.outputType,
              title: o.title,
              isScheduleForPost: o.isScheduleForPost,
              scheduledAt: o.scheduledAt,
              fileId: o.fileId,
              status: o.status,
              url: o.url,
              postedAt: o.postedAt,
              isTrackingActive: o.isTrackingActive,
            })),
            campaignEnterpriseOutputs: post.campaignEnterpriseOutputs.map((o) => ({
              id: o.id!,
              platformId: o.platformId,
              uniqueId: o.uniqueId || null,
              outputType: o.outputType,
              title: o.title,
              isScheduleForPost: o.isScheduleForPost,
              scheduledAt: o.scheduledAt,
              fileId: o.fileId,
              status: o.status,
              url: o.url,
              postedAt: o.postedAt,
              isTrackingActive: o.isTrackingActive,
            })),
          })),
        })),
      } : undefined,
      participants: root.participants.map((p) => ({
        id: p.id!,
        kolProfileId: p.kolProfileId,
        status: p.status,
        joinedAt: p.joinedAt,
      })),
    };
  }

  static toListDto(roots: CampaignRoot[]): CampaignDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
