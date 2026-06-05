import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CampaignNotFoundException, UserNotFoundException } from '@/core/exceptions';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories/user.repository';
import { MAILER_SERVICE, type IMailerService } from '@/application/interfaces/mailer.interface';
import { CampaignInviteCollaboratorCommand } from './campaign-invite-collaborator.command';

@CommandHandler(CampaignInviteCollaboratorCommand)
export class CampaignInviteCollaboratorCommandHandler implements ICommandHandler<CampaignInviteCollaboratorCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(MAILER_SERVICE)
    private readonly mailerService: IMailerService,
  ) { }

  async execute(command: CampaignInviteCollaboratorCommand): Promise<void> {
    const { campaignId, userId, requestedBy } = command;

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new CampaignNotFoundException(campaignId);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    campaign.inviteCollaborator(userId, requestedBy);

    await this.campaignRepository.save(campaign);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Invitation to Collaborate on Campaign',
        template: 'campaign-collaborator-invite',
        context: {
          campaignId: campaign.id,
          description: campaign.description,
          budget: campaign.budget,
        },
      });
    } catch (err) {
      // Avoid failing the transaction if mail server fails
    }
  }
}
