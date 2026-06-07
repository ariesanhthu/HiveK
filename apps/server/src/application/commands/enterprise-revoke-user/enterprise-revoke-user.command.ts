import { EnterpriseRevokeUserInputDto } from './enterprise-revoke-user.dto';

export class EnterpriseRevokeUserCommand {
  constructor(
    public readonly input: EnterpriseRevokeUserInputDto,
    public readonly requestedBy: string,
  ) {}
}
