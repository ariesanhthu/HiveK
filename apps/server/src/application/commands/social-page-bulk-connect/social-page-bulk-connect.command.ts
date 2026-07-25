import { SocialPageBulkConnectInputDto } from './social-page-bulk-connect.dto';

export class SocialPageBulkConnectCommand {
  constructor(
    public readonly enterpriseId: string,
    public readonly input: SocialPageBulkConnectInputDto,
  ) {}
}
