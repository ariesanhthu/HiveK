import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CampaignNotFoundException, UserNotFoundException } from '@/core/exceptions';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories/user.repository';
import { MAILER_SERVICE, type IMailerService } from '@/application/interfaces/mailer.interface';
import { CampaignRevokeCollaboratorCommand } from './campaign-revoke-collaborator.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(CampaignRevokeCollaboratorCommand)
export class CampaignRevokeCollaboratorCommandHandler implements ICommandHandler<CampaignRevokeCollaboratorCommand, void> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(MAILER_SERVICE)
    private readonly mailerService: IMailerService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  async execute(command: CampaignRevokeCollaboratorCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { campaignId, userId, requestedBy } = command;

      const campaign = await this.campaignRepository.findById(campaignId);
      if (!campaign) {
        throw new CampaignNotFoundException(campaignId);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      campaign.revokeCollaborator(userId, requestedBy);

      await this.campaignRepository.save(campaign);

      try {
        await this.mailerService.sendMail({
          to: user.email,
          subject: 'Collaboration Revoked on Campaign',
          template: 'campaign-collaborator-revoke',
          context: {
            campaignId: campaign.id,
            description: campaign.description,
          },
        });
      } catch (err) {
        // Avoid failing the transaction if mail server fails
      }
    });
  }
}
