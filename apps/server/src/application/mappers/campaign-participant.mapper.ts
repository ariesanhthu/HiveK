import { CampaignParticipantDto } from '../dtos/campaign-participant.dto';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';

export class CampaignParticipantMapper {
  static toDto(root: CampaignParticipantRoot): CampaignParticipantDto {
    return {
      id: root.id!,
      campaignId: root.campaignId,
      kolProfileId: root.kolProfileId,
      status: root.status,
      joinedAt: root.joinedAt ? root.joinedAt.toISOString() : null,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
      outputs: root.outputs.map((o) => ({
        id: o.id,
        platformId: o.platformId,
        outputType: o.outputType,
        title: o.title,
        isScheduleForPost: o.isScheduleForPost,
        fileId: o.fileId,
        scheduledAt: o.scheduledAt ? o.scheduledAt.toISOString() : null,
        status: o.status,
        url: o.url,
        postedAt: o.postedAt ? o.postedAt.toISOString() : null,
      })),
    };
  }

  static toListDto(roots: CampaignParticipantRoot[]): CampaignParticipantDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
