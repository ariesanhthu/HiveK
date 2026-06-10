import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { MESSAGE_QUEUE_SERVICE, type IMessageQueueService } from '@/application/interfaces';
import { CampaignParticipantNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { EParticipantStatus, EOutputStatus } from '@/core/enums';
import { CampaignParticipantUpdateCommand } from './campaign-participant-update.command';
import { CampaignOutput } from '@/core/aggregate-roots/campaign-participant.aggregate';

@CommandHandler(CampaignParticipantUpdateCommand)
export class CampaignParticipantUpdateCommandHandler implements ICommandHandler<CampaignParticipantUpdateCommand, void> {
  constructor(
    @Inject(CAMPAIGN_PARTICIPANT_REPOSITORY)
    private readonly participantRepository: ICampaignParticipantRepository,
    @Inject(MESSAGE_QUEUE_SERVICE)
    private readonly messageQueueService: IMessageQueueService,
  ) {}

  async execute(command: CampaignParticipantUpdateCommand): Promise<void> {
    const { id, input } = command;

    const participant = await this.participantRepository.findById(id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    if (input.status) {
      if (input.status === EParticipantStatus.JOINED && participant.status === EParticipantStatus.PENDING_APPROVAL) {
        participant.join();
      } else if (input.status === EParticipantStatus.REJECTED) {
        participant.reject();
      } else if (input.status === EParticipantStatus.COMPLETED) {
        participant.complete();
      } else {
        participant.update({ status: input.status });
      }
    }

    const trackingEventsToEmit: any[] = [];

    if (input.outputs) {
      const mappedOutputs: CampaignOutput[] = input.outputs.map((o) => {
        const outputId = o.id || new Types.ObjectId().toString();
        const existingOutput = o.id ? participant.outputs.find((x) => x.id === o.id) : null;
        const fileId = existingOutput ? existingOutput.fileId : null;

        const status = o.isScheduleForPost ? EOutputStatus.SCHEDULED : EOutputStatus.PUBLISHED;
        const url = o.isScheduleForPost ? null : o.url || null;
        const postedAt = o.isScheduleForPost ? null : new Date();

        if (!o.isScheduleForPost && !url) {
          throw new InvalidOperationException('Published output requires a URL');
        }

        const isNewlyPublished = status === EOutputStatus.PUBLISHED && url && (!existingOutput || existingOutput.status !== EOutputStatus.PUBLISHED || !existingOutput.isTrackingActive);

        if (isNewlyPublished) {
          trackingEventsToEmit.push({
            campaignId: participant.campaignId,
            participantId: participant.id,
            outputId,
            url,
            platformId: o.platformId || (existingOutput ? existingOutput.platformId : ''),
          });
        }

        return {
          id: outputId,
          platformId: o.platformId || (existingOutput ? existingOutput.platformId : ''),
          outputType: o.outputType,
          title: o.title,
          isScheduleForPost: o.isScheduleForPost,
          fileId,
          scheduledAt: o.scheduledAt ? new Date(o.scheduledAt) : null,
          status,
          url,
          postedAt: existingOutput && existingOutput.status === EOutputStatus.PUBLISHED ? existingOutput.postedAt : postedAt,
          isTrackingActive: existingOutput ? existingOutput.isTrackingActive : (status === EOutputStatus.PUBLISHED),
        };
      });

      participant.updateOutputs(mappedOutputs);
    }

    await this.participantRepository.save(participant);

    for (const event of trackingEventsToEmit) {
      this.messageQueueService.emit('tracking.start', event);
    }
  }
}
