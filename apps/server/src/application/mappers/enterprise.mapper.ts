import { EnterpriseDto } from '@/application/dtos';
import { EnterpriseRoot } from '@/core/aggregate-roots/enterprise.aggregate';

export class EnterpriseMapper {
  static toDto(root: EnterpriseRoot): EnterpriseDto {
    return {
      id: root.id!,
      userId: root.userId,
      companyName: root.companyName,
      description: root.description,
      contactEmail: root.contactEmail,
      contactPhone: root.contactPhone?.value,
      website: root.website,
      taxId: root.taxId,
      logoUrlId: root.logoUrlId,
      isVerified: root.isVerified,
      members: (root.members || []).map((m) => ({
        userId: m.userId,
        mode: m.mode,
      })),
      knowledgeBase: root.knowledgeBase
        ? {
            rawText: root.knowledgeBase.rawText,
            externalLinks: root.knowledgeBase.externalLinks,
            updatedAt: root.knowledgeBase.updatedAt.toISOString(),
          }
        : undefined,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };
  }

  static toListDto(roots: EnterpriseRoot[]): EnterpriseDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
