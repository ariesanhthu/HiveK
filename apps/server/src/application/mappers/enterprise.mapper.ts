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
      contactPhone: root.contactPhone,
      website: root.website,
      taxId: root.taxId,
      logoUrlId: root.logoUrlId,
      isVerified: root.isVerified,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };
  }

  static toListDto(roots: EnterpriseRoot[]): EnterpriseDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
