import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CampaignNotFoundException,
  UserNotFoundException,
} from '@/core/exceptions';
import {
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
} from '@/core/interfaces/repositories/campaign.repository';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/core/interfaces/repositories/user.repository';
import {
  MAILER_SERVICE,
  type IMailerService,
} from '@/application/interfaces/mailer.interface';
import { CampaignInviteCollaboratorCommand } from './campaign-invite-collaborator.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(CampaignInviteCollaboratorCommand)
export class CampaignInviteCollaboratorCommandHandler implements ICommandHandler<
  CampaignInviteCollaboratorCommand,
  void
> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(MAILER_SERVICE)
    private readonly mailerService: IMailerService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: CampaignInviteCollaboratorCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { campaignId, dto, requestedBy } = command;

      const campaign = await this.campaignRepository.findById(campaignId);
      if (!campaign) {
        throw new CampaignNotFoundException(campaignId);
      }

      const users = await this.userRepository.findByIds(dto.memberIds);
      if (users.length !== dto.memberIds.length) {
        const foundIds = new Set(users.map((u) => u.id));
        const missingIds = dto.memberIds.filter((id) => !foundIds.has(id));
        throw new UserNotFoundException(missingIds.join(', '));
      }

      for (const userId of dto.memberIds) {
        campaign.inviteCollaborator(userId, requestedBy);
      }

      await this.campaignRepository.save(campaign);

      for (const user of users) {
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
        } catch {
          // Avoid failing the transaction if mail server fails
        }
      }
    });
  }
}
