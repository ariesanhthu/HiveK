import { type IMessageQueueService, MESSAGE_QUEUE_SERVICE } from '@/application/interfaces';
import { CampaignKOLOutputEntity } from '@/core/entities';
import { EOutputStatus, EParticipantStatus } from '@/core/enums';
import { CampaignParticipantNotFoundException, InvalidOperationException } from '@/core/exceptions';
import {
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
} from '@/core/interfaces/repositories/campaign.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CampaignParticipantUpdateCommand } from './campaign-participant-update.command';

@CommandHandler(CampaignParticipantUpdateCommand)
export class CampaignParticipantUpdateCommandHandler
  implements ICommandHandler<CampaignParticipantUpdateCommand, void>
{
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaignRepository,
    @Inject(MESSAGE_QUEUE_SERVICE) private readonly messageQueueService: IMessageQueueService,
  ) {}

  async execute(command: CampaignParticipantUpdateCommand): Promise<void> {
    const { id, input } = command;

    const campaign = await this.campaignRepository.findByParticipantId(id);
    if (!campaign) {
      throw new CampaignParticipantNotFoundException(id);
    }

    const participant = campaign.participants.find(p => p.id === id);
    if (!participant) {
      throw new CampaignParticipantNotFoundException(id);
    }

    if (input.status) {
      if (
        input.status === EParticipantStatus.JOINED
        && participant.status === EParticipantStatus.PENDING_APPROVAL
      ) {
        campaign.joinParticipant(participant.kolProfileId);
      } else if (input.status === EParticipantStatus.REJECTED) {
        campaign.rejectParticipant(participant.kolProfileId);
      } else if (input.status === EParticipantStatus.COMPLETED) {
        campaign.completeParticipant(participant.kolProfileId);
      } else {
        participant.updateStatus(input.status);
      }
    }

    const trackingEventsToEmit: any[] = [];

    const findExistingOutput = (outputId: string) => {
      if (!campaign.props.schedule?.timeline) return null;
      for (const day of campaign.props.schedule.timeline) {
        for (const post of day.posts) {
          const found = post.campaignKOLOutputs.find(x => x.id === outputId);
          if (found) return found;
        }
      }
      return null;
    };

    if (input.outputs) {
      const mappedOutputs: CampaignKOLOutputEntity[] = input.outputs.map((o) => {
        const outputId = o.id || new Types.ObjectId().toString();
        const existingOutput = o.id ? findExistingOutput(o.id) : null;
        const fileId = existingOutput ? existingOutput.fileId : null;

        const status = o.isScheduleForPost ? EOutputStatus.SCHEDULED : EOutputStatus.PUBLISHED;
        const url = o.isScheduleForPost ? null : o.url || null;
        const postedAt = o.isScheduleForPost ? null : new Date();

        if (!o.isScheduleForPost && !url) {
          throw new InvalidOperationException('Published output requires a URL');
        }

        const isNewlyPublished = status === EOutputStatus.PUBLISHED && url
          && (!existingOutput || existingOutput.status !== EOutputStatus.PUBLISHED
            || !existingOutput.isTrackingActive);

        if (isNewlyPublished) {
          trackingEventsToEmit.push({
            campaignId: campaign.id!,
            participantId: participant.id,
            outputId,
            url,
            platformId: o.platformId || (existingOutput ? existingOutput.platformId : ''),
          });
        }

        return CampaignKOLOutputEntity.instantiate(outputId, {
          campaignParticipantId: participant.id,
          platformId: o.platformId || (existingOutput ? existingOutput.platformId : ''),
          uniqueId: existingOutput ? (existingOutput.uniqueId || null) : null,
          outputType: o.outputType,
          title: o.title,
          isScheduleForPost: o.isScheduleForPost,
          fileId,
          scheduledAt: o.scheduledAt ? new Date(o.scheduledAt) : null,
          status,
          url,
          postedAt: existingOutput && existingOutput.status === EOutputStatus.PUBLISHED
            ? existingOutput.postedAt
            : postedAt,
          isTrackingActive: existingOutput
            ? existingOutput.isTrackingActive
            : (status === EOutputStatus.PUBLISHED),
          createdAt: existingOutput ? existingOutput.createdAt : new Date(),
          updatedAt: new Date(),
        });
      });

      campaign.updateKOLOutputs(participant.id, mappedOutputs);
    }

    await this.campaignRepository.save(campaign);

    for (const event of trackingEventsToEmit) {
      this.messageQueueService.emit('tracking.start', event);
    }
  }
}
