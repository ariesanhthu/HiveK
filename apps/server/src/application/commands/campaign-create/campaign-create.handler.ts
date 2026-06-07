import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignRoot } from '@/core/aggregate-roots';
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
    });

    await this.campaignRepository.save(campaign);

    return CampaignMapper.toDto(campaign);
  }
}
