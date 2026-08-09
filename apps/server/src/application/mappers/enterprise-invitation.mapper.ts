import { EnterpriseInvitationDto } from '@/application/dtos/enterprise-invitation.dto';
import { EnterpriseInvitationRoot } from '@/core/aggregate-roots/enterprise-invitation.aggregate';

export class EnterpriseInvitationMapper {
  static toDto(root: EnterpriseInvitationRoot): EnterpriseInvitationDto {
    return {
      id: root.id,
      enterpriseId: root.enterpriseId,
      email: root.email,
      mode: root.mode,
      inviterId: root.inviterId,
      status: root.status,
      expiresAt: root.expiresAt.toISOString(),
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };
  }

  static toListDto(
    roots: EnterpriseInvitationRoot[],
  ): EnterpriseInvitationDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
