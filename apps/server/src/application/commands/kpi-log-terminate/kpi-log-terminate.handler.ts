import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
} from '@/core/interfaces/repositories/campaign.repository';
import { KpiLogTerminateCommand } from './kpi-log-terminate.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { KpiTrackingTerminatedEvent } from '@/application/events';

@CommandHandler(KpiLogTerminateCommand)
export class KpiLogTerminateCommandHandler implements ICommandHandler<
  KpiLogTerminateCommand,
  void
> {
  private readonly logger = new Logger(KpiLogTerminateCommandHandler.name);

  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    private readonly eventBus: EventBus,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
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

      // @code-comment(SchedulePost): updateTrackingStatus disabled — schedule posts are now ScheduledPost IDs.
      // try {
      //   campaign.updateTrackingStatus(payload.outputId, false);
      //   await this.campaignRepository.save(campaign);
      // } catch (e) {
      //   this.logger.error(`Error terminating tracking: ${e.message}`);
      // }

      this.eventBus.publish(
        new KpiTrackingTerminatedEvent(payload.participantId, payload.outputId),
      );
    });
  }
}
