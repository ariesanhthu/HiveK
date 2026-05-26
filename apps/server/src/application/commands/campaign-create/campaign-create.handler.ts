import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, type ICampaignRepository } from '@/core/interfaces';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignCreateCommand } from './campaign-create.command';
import { CampaignDto } from '@/application/dtos';
import { CampaignMapper } from '@/application/mappers';

@CommandHandler(CampaignCreateCommand)
export class CreateCampaignHandler implements ICommandHandler<CampaignCreateCommand, CampaignDto> {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(command: CampaignCreateCommand): Promise<CampaignDto> {
    const { input } = command;

    const campaign = CampaignRoot.create({
      ownerId: input.ownerId,
      enterpriseId: input.enterpriseId,
      campaign: {
        name: input.campaign.name,
        type: input.campaign.type,
        startDate: new Date(input.campaign.startDate),
        endDate: new Date(input.campaign.endDate),
        objective: input.campaign.objective,
        description: input.campaign.description,
      },
      targeting: {
        audience: {
          ageRange: input.targeting.audience.ageRange,
          interests: input.targeting.audience.interests,
        },
        locations: input.targeting.locations,
      },
      campaignItems: input.campaignItems.map((item) => ({
        product: {
          name: item.product.name,
          category: item.product.category,
          brand: item.product.brand,
          description: item.product.description,
          features: item.product.features,
          keywords: item.product.keywords,
          priceSegment: item.product.priceSegment,
        },
        marketing: {
          angle: item.marketing.angle,
          contentStyle: item.marketing.contentStyle,
          tone: item.marketing.tone,
          keyMessages: item.marketing.keyMessages,
        },
        pricing: {
          originalPrice: item.pricing.originalPrice,
          salePrice: item.pricing.salePrice,
          currency: item.pricing.currency,
        },
        promotion: {
          type: item.promotion.type,
          value: item.promotion.value,
          unit: item.promotion.unit,
        },
        channels: item.channels.map((chan) => ({
          type: chan.type,
          platform: chan.platform,
          url: chan.url,
        })),
      })),
      raw: input.raw.map((r) => ({
        fileId: r.fileId,
        rawText: r.rawText,
        inference: r.inference,
      })),
    });

    await this.campaignRepository.save(campaign);

    return CampaignMapper.toDto(campaign);
  }
}
