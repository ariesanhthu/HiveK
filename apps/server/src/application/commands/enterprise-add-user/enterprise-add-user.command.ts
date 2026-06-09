import { EnterpriseAddUserInputDto } from './enterprise-add-user.dto';

export class EnterpriseAddUserCommand {
  constructor(
    public readonly enterpriseId: string,
    public readonly input: EnterpriseAddUserInputDto,
    public readonly requestedBy: string,
  ) {}
}
