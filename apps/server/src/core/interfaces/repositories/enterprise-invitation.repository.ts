import { IBaseRepository } from '../../common';
import { EnterpriseInvitationRoot } from '../../aggregate-roots/enterprise-invitation.aggregate';

export interface IEnterpriseInvitationRepository extends IBaseRepository<EnterpriseInvitationRoot> {
  findByEmailAndEnterpriseId(email: string, enterpriseId: string): Promise<EnterpriseInvitationRoot | null>;
  findPendingByEmailAndEnterpriseId(email: string, enterpriseId: string): Promise<EnterpriseInvitationRoot | null>;
  findByEnterpriseId(enterpriseId: string): Promise<EnterpriseInvitationRoot[]>;
}

export const ENTERPRISE_INVITATION_REPOSITORY = Symbol('IEnterpriseInvitationRepository');
