import { Injectable, Inject } from '@nestjs/common';
import { ETargetType, EUploadTargetField } from '@/core/enums';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import {
  USER_REPOSITORY,
  type IUserRepository,
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
  PLATFORM_REPOSITORY,
  type IPlatformRepository,
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
  SCHEDULED_POST_REPOSITORY,
  type IScheduledPostRepository,
} from '@/core/interfaces/repositories';

@Injectable()
export class FileLinkerService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepo: IEnterpriseRepository,
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepo: IPlatformRepository,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepo: ICampaignRepository,
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepo: IScheduledPostRepository,
  ) {}

  async link(root: UploadedFileRoot): Promise<void> {
    switch (root.targetType) {
      case ETargetType.USER:
        return this.linkUser(root);
      case ETargetType.ENTERPRISE:
        return this.linkEnterprise(root);
      case ETargetType.PLATFORM:
        return this.linkPlatform(root);
      case ETargetType.CAMPAIGN:
        return this.linkCampaign(root);
      case ETargetType.SCHEDULED_POST:
        return this.linkScheduledPost(root);
      default:
        // TODO: CAMPAIGN_PARTICIPANT linking - deferred (see plan Q1)
        return;
    }
  }

  private async linkUser(root: UploadedFileRoot): Promise<void> {
    if (root.targetField !== EUploadTargetField.AVATAR) return;
    const user = await this.userRepo.findById(root.targetId);
    if (!user) return;
    user.setAvatar(root.id);
    await this.userRepo.save(user);
  }

  private async linkEnterprise(root: UploadedFileRoot): Promise<void> {
    if (root.targetField !== EUploadTargetField.LOGO_URL_ID) return;
    const enterprise = await this.enterpriseRepo.findById(root.targetId);
    if (!enterprise) return;
    enterprise.update({ logoUrlId: root.id });
    await this.enterpriseRepo.save(enterprise);
  }

  private async linkPlatform(root: UploadedFileRoot): Promise<void> {
    if (root.targetField !== EUploadTargetField.ICON) return;
    const platform = await this.platformRepo.findById(root.targetId);
    if (!platform) return;
    platform.updateIcon(root.id);
    await this.platformRepo.save(platform);
  }

  private async linkCampaign(root: UploadedFileRoot): Promise<void> {
    if (root.targetField !== EUploadTargetField.RAW) return;
    const campaign = await this.campaignRepo.findById(root.targetId);
    if (!campaign) return;
    const updatedRaw = [
      ...(campaign.rawContents || []),
      {
        fileId: root.id,
        rawContent: '',
      },
    ];
    campaign.update({ rawContents: updatedRaw });
    await this.campaignRepo.save(campaign);
  }

  private async linkScheduledPost(root: UploadedFileRoot): Promise<void> {
    if (root.targetField !== EUploadTargetField.MEDIA_FILE_IDS) return;
    const post = await this.scheduledPostRepo.findById(root.targetId);
    if (!post) return;
    post.addMediaFile(root.id);
    await this.scheduledPostRepo.save(post);
  }
}
