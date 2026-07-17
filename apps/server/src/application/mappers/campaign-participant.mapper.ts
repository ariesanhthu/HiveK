import { CampaignParticipantEntity } from '@/core/entities';
import { CampaignParticipantDto } from '@/application/dtos';

export class CampaignParticipantMapper {
  static toDto(root: CampaignParticipantEntity): CampaignParticipantDto {
    return {
      id: root.id!,
      campaignId: '',
      kolProfileId: root.kolProfileId,
      status: root.status,
      joinedAt: root.joinedAt ? root.joinedAt.toISOString() : null,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
      outputs: [],
    } as unknown as CampaignParticipantDto;
  }

  static toListDto(roots: CampaignParticipantEntity[]): CampaignParticipantDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
