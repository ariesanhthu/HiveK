import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CampaignNotFoundException } from '@/core/exceptions';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignUpdateCommand } from './campaign-update.command';
import { CampaignDto } from '@/application/dtos';
import { CampaignMapper } from '@/application/mappers';

@CommandHandler(CampaignUpdateCommand)
export class UpdateCampaignHandler implements ICommandHandler<CampaignUpdateCommand, CampaignDto> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) { }

  async execute(command: CampaignUpdateCommand): Promise<CampaignDto> {
    const { id, input } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new CampaignNotFoundException(id);
    }

    const updateProps: any = {};
    if (input.ownerId) updateProps.ownerId = input.ownerId;
    if (input.enterpriseId !== undefined) updateProps.enterpriseId = input.enterpriseId;
    if (input.budget !== undefined) updateProps.budget = input.budget;
    if (input.financialTarget) updateProps.financialTarget = input.financialTarget;
    if (input.description) updateProps.description = input.description;

    if (input.platformTarget) {
      updateProps.platformTarget = input.platformTarget.map((item) => ({
        platformId: item.platformId,
        minFollowers: item.minFollowers,
        maxFollowers: item.maxFollowers,
        note: item.note,
        others: item.others,
      }));
    }

    campaign.update(updateProps);

    await this.campaignRepository.save(campaign);

    return CampaignMapper.toDto(campaign);
  }
}
