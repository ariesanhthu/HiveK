import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { KpiLogTerminateCommand } from './kpi-log-terminate.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { KpiTrackingTerminatedEvent } from '@/application/events';

@CommandHandler(KpiLogTerminateCommand)
export class KpiLogTerminateCommandHandler implements ICommandHandler<KpiLogTerminateCommand, void> {
  private readonly logger = new Logger(KpiLogTerminateCommandHandler.name);

  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
    private readonly eventBus: EventBus,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: KpiLogTerminateCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { payload } = command;

      if (!payload.participantId || !payload.outputId) {
        this.logger.error('Received KPI termination event without participantId or outputId', JSON.stringify(payload));
        return;
      }

      const participant = await this.participantRepository.findById(payload.participantId);
      if (!participant) {
        this.logger.error(`Participant ${payload.participantId} not found for termination event`);
        return;
      }

      try {
        participant.updateTrackingStatus(payload.outputId, false);
        await this.participantRepository.save(participant);
        this.logger.log(`Terminated tracking for output ${payload.outputId} of participant ${payload.participantId}`);
      } catch (e) {
        this.logger.error(`Error terminating tracking: ${e.message}`);
      }
      
      this.eventBus.publish(new KpiTrackingTerminatedEvent(payload.participantId, payload.outputId));
    });
  }
}
