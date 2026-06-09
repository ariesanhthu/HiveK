import { EnterpriseRevokeUserInputDto } from './enterprise-revoke-user.dto';

export class EnterpriseRevokeUserCommand {
  constructor(
    public readonly enterpriseId: string,
    public readonly input: EnterpriseRevokeUserInputDto,
    public readonly requestedBy: string,
  ) {}
}
