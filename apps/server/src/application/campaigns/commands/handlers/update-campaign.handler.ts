import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces';
import { UpdateCampaignCommand } from '../update-campaign.command';
import { CampaignDto } from '../../dtos';
import { CampaignMapper } from '../../mappers/campaign.mapper';

@CommandHandler(UpdateCampaignCommand)
export class UpdateCampaignHandler implements ICommandHandler<UpdateCampaignCommand, CampaignDto> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: UpdateCampaignCommand): Promise<CampaignDto> {
    const { id, input } = command;

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    const updateProps: any = {};
    if (input.ownerId) updateProps.ownerId = input.ownerId;
    if (input.enterpriseId) updateProps.enterpriseId = input.enterpriseId;

    if (input.campaign) {
      updateProps.campaign = {
        name: input.campaign.name,
        type: input.campaign.type,
        startDate: input.campaign.startDate ? new Date(input.campaign.startDate) : undefined,
        endDate: input.campaign.endDate ? new Date(input.campaign.endDate) : undefined,
        objective: input.campaign.objective,
        description: input.campaign.description,
      };
    }

    if (input.targeting) {
      updateProps.targeting = {
        audience: input.targeting.audience ? {
          ageRange: input.targeting.audience.ageRange,
          interests: input.targeting.audience.interests,
        } : undefined,
        locations: input.targeting.locations,
      };
    }

    if (input.campaignItems) {
      updateProps.campaignItems = input.campaignItems.map((item) => ({
        product: {
          name: item.product?.name,
          category: item.product?.category,
          brand: item.product?.brand,
          description: item.product?.description,
          features: item.product?.features,
          keywords: item.product?.keywords,
          priceSegment: item.product?.priceSegment,
        },
        marketing: {
          angle: item.marketing?.angle,
          contentStyle: item.marketing?.contentStyle,
          tone: item.marketing?.tone,
          keyMessages: item.marketing?.keyMessages,
        },
        pricing: {
          originalPrice: item.pricing?.originalPrice,
          salePrice: item.pricing?.salePrice,
          currency: item.pricing?.currency,
        },
        promotion: {
          type: item.promotion?.type,
          value: item.promotion?.value,
          unit: item.promotion?.unit,
        },
        channels: item.channels ? item.channels.map((chan) => ({
          type: chan.type,
          platform: chan.platform,
          url: chan.url,
        })) : [],
      }));
    }

    if (input.raw) {
      updateProps.raw = input.raw.map((r) => ({
        fileId: r.fileId,
        rawText: r.rawText,
        inference: r.inference,
      }));
    }

    campaign.update(updateProps);

    await this.campaignRepository.save(campaign);

    return CampaignMapper.toDto(campaign);
  }
}
