import { KpiTrackingTerminatedEvent } from '@/application/events';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import {
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
} from '@/core/interfaces/repositories/campaign.repository';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { KpiLogTerminateCommand } from './kpi-log-terminate.command';

@CommandHandler(KpiLogTerminateCommand)
export class KpiLogTerminateCommandHandler implements
  ICommandHandler<
    KpiLogTerminateCommand,
    void
  >
{
  private readonly logger = new Logger(KpiLogTerminateCommandHandler.name);

  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaignRepository,
    private readonly eventBus: EventBus,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: KpiLogTerminateCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { payload } = command;

      if (!payload.participantId || !payload.outputId) {
        this.logger.error(
          'Received KPI termination event without participantId or outputId',
          JSON.stringify(payload),
        );
        return;
      }

      const campaign = await this.campaignRepository.findByParticipantId(
        payload.participantId,
      );
      if (!campaign) {
        this.logger.error(
          `Campaign for Participant ${payload.participantId} not found for termination event`,
        );
        return;
      }

      try {
        campaign.updateTrackingStatus(payload.outputId, false);
        await this.campaignRepository.save(campaign);
        this.logger.log(
          `Terminated tracking for output ${payload.outputId} of participant ${payload.participantId}`,
        );
      } catch (e) {
        this.logger.error(`Error terminating tracking: ${e.message}`);
      }

      this.eventBus.publish(
        new KpiTrackingTerminatedEvent(payload.participantId, payload.outputId),
      );
    });
  }
}
