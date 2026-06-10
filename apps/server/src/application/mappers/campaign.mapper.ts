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
    };
  }

  static toListDto(roots: CampaignRoot[]): CampaignDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
