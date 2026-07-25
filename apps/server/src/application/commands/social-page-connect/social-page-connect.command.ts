import { SocialPageConnectInputDto } from './social-page-connect.dto';

export class SocialPageConnectCommand {
  constructor(
    public readonly enterpriseId: string,
    public readonly input: SocialPageConnectInputDto,
  ) {}
}
