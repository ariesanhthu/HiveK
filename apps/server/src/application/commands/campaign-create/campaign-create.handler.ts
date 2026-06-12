import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignRoot } from '@/core/aggregate-roots';
import { ESchedulePostStatus } from '@/core/enums';
import { CampaignKOLOutputEntity, CampaignEnterpriseOutputEntity } from '@/core/entities';
import { CampaignCreateCommand } from './campaign-create.command';
import { CampaignDto } from '@/application/dtos';
import { CampaignMapper } from '@/application/mappers';

@CommandHandler(CampaignCreateCommand)
export class CampaignCreateCommandHandler implements ICommandHandler<CampaignCreateCommand, CampaignDto> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) { }

  async execute(command: CampaignCreateCommand): Promise<CampaignDto> {
    const { input } = command;

    const schedule = input.schedule ? {
      timeline: (input.schedule.timeline || []).map((day) => ({
        date: new Date(day.date),
        label: day.label,
        posts: (day.posts || []).map((post) => ({
          scheduledTime: new Date(post.scheduledTime),
          platformId: post.platformId,
          status: (post.status || ESchedulePostStatus.DRAFT) as ESchedulePostStatus,
          campaignKOLOutputs: (post.campaignKOLOutputs || []).map((o) =>
            CampaignKOLOutputEntity.instantiate(o.id || new Types.ObjectId().toString(), {
              campaignParticipantId: o.campaignParticipantId,
              platformId: o.platformId,
              uniqueId: o.uniqueId || null,
              outputType: o.outputType,
              title: o.title,
              isScheduleForPost: o.isScheduleForPost,
              scheduledAt: o.scheduledAt ? new Date(o.scheduledAt) : null,
              fileId: o.fileId || null,
              status: o.status,
              url: o.url || null,
              postedAt: o.postedAt ? new Date(o.postedAt) : null,
              isTrackingActive: o.isTrackingActive || false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          ),
          campaignEnterpriseOutputs: (post.campaignEnterpriseOutputs || []).map((o) =>
            CampaignEnterpriseOutputEntity.instantiate(o.id || new Types.ObjectId().toString(), {
              platformId: o.platformId,
              uniqueId: o.uniqueId || undefined,
              outputType: o.outputType,
              title: o.title,
              isScheduleForPost: o.isScheduleForPost,
              scheduledAt: o.scheduledAt ? new Date(o.scheduledAt) : null,
              fileId: o.fileId || null,
              status: o.status,
              url: o.url || null,
              postedAt: o.postedAt ? new Date(o.postedAt) : null,
              isTrackingActive: o.isTrackingActive || false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          ),
        })),
      })),
    } : undefined;

    const campaign = CampaignRoot.create({
      ownerId: input.ownerId,
      enterpriseId: input.enterpriseId,
      budget: input.budget,
      financialTarget: input.financialTarget,
      description: input.description,
      platformTarget: (input.platformTarget || []).map((item) => ({
        platformId: item.platformId,
        minFollowers: item.minFollowers,
        maxFollowers: item.maxFollowers,
        note: item.note,
        others: item.others,
      })),
      rawContents: [],
      schedule,
    });

    await this.campaignRepository.save(campaign);

    return CampaignMapper.toDto(campaign);
  }
}
