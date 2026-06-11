import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { KOL_PROFILE_REPOSITORY, type IKolProfileRepository } from '@/core/interfaces/repositories/kol-profile.repository';
import { InvalidOperationException, CampaignNotFoundException, UserNotFoundException } from '@/core/exceptions';
import { CampaignParticipantCreateCommand } from './campaign-participant-create.command';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { OutboxService } from '@/application/services/outbox.service';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { EventMapper } from '@/application/mappers';

@CommandHandler(CampaignParticipantCreateCommand)
export class CampaignParticipantCreateCommandHandler implements ICommandHandler<CampaignParticipantCreateCommand, string> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
    private readonly outboxService: OutboxService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: CampaignParticipantCreateCommand): Promise<string> {
    let participantId = '';

    await this.uow.execute(async () => {
      const { input } = command;

      const campaign = await this.campaignRepository.findById(input.campaignId);
      if (!campaign) {
        throw new CampaignNotFoundException(input.campaignId);
      }

      if (campaign.status !== ECampaignStatus.FINDING_KOL && campaign.status !== ECampaignStatus.IN_PROGRESS) {
        throw new InvalidOperationException('KOLs can only join campaigns that are in FINDING_KOL or IN_PROGRESS status');
      }

      const kolProfile = await this.kolProfileRepository.findById(input.kolProfileId);
      if (!kolProfile) {
        throw new UserNotFoundException(input.kolProfileId);
      }

      if (!kolProfile.userId) {
        throw new InvalidOperationException('KOL profile is not linked to a user');
      }

      const existing = campaign.participants.some(p => p.kolProfileId === input.kolProfileId);
      if (existing) {
        throw new InvalidOperationException('KOL is already a participant of this campaign');
      }

      participantId = campaign.addParticipant(input.kolProfileId, kolProfile.email);

      await this.campaignRepository.save(campaign);

      const events = EventMapper.mapToIntegrationEvents(campaign.domainEvents);
      if (events.length > 0) {
        await this.outboxService.enqueueMany(events.map(event => ({
          eventType: event.eventType,
          payload: event.payload,
          metadata: event.metadata,
          transport: event.transport,
          maxRetry: 5,
        })));
      }
      campaign.clearDomainEvents();
    });

    return participantId;
  }
}
