import { CampaignDto } from '@/application/dtos';
import { CampaignMapper } from '@/application/mappers';
import { CampaignForbiddenException, CampaignNotFoundException } from '@/core/exceptions';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CampaignUpdateCommand } from './campaign-update.command';

@CommandHandler(CampaignUpdateCommand)
export class CampaignUpdateCommandHandler implements
  ICommandHandler<
    CampaignUpdateCommand,
    CampaignDto
  >
{
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: CampaignUpdateCommand): Promise<CampaignDto> {
    const { id, requestedBy, input } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new CampaignNotFoundException(id);
    }

    // Owner and collaborator can update
    if (
      campaign.ownerId !== requestedBy
      && !campaign.collaboratorIds.includes(requestedBy)
    ) {
      throw new CampaignForbiddenException();
    }

    const campaignUpdateProps = {
      ...(input.budget !== undefined ? { budget: input.budget } : {}),
      ...(input.financialTarget !== undefined
        ? { financialTarget: input.financialTarget }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.platformTarget !== undefined
        ? {
          platformTarget: input.platformTarget.map((item) => ({
            platformId: item.platformId,
            minFollowers: item.minFollowers,
            maxFollowers: item.maxFollowers,
            note: item.note,
            others: item.others,
          })),
        }
        : {}),
    };

    campaign.update(campaignUpdateProps);

    await this.campaignRepository.save(campaign);

    return CampaignMapper.toDto(campaign);
  }
}
