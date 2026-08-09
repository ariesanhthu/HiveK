import { IBaseReadService } from './base.read-service.interface';
import { EnterpriseInvitationDto } from '@/application/dtos';
import { EnterpriseInvitationFilterDto } from '@/application/queries/enterprise-get-my-invitations/enterprise-get-my-invitations.dto';

export const ENTERPRISE_INVITATION_READ_SERVICE = Symbol(
  'ENTERPRISE_INVITATION_READ_SERVICE',
);

export interface IEnterpriseInvitationReadService extends IBaseReadService<
  EnterpriseInvitationDto,
  EnterpriseInvitationFilterDto
> {}
