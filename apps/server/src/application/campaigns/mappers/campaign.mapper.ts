import { CampaignDto } from '../dtos';
import { CampaignRoot } from '@/core/aggregate-roots';

export class CampaignMapper {
  static toDto(root: CampaignRoot): CampaignDto {
    return {
      id: root.id!,
      ownerId: root.ownerId,
      enterpriseId: root.enterpriseId,
      campaign: {
        name: root.campaign.name,
        type: root.campaign.type,
        startDate: root.campaign.startDate.toISOString(),
        endDate: root.campaign.endDate.toISOString(),
        objective: root.campaign.objective,
        description: root.campaign.description,
      },
      targeting: {
        audience: {
          ageRange: root.targeting.audience.ageRange,
          interests: root.targeting.audience.interests,
        },
        locations: root.targeting.locations,
      },
      campaignItems: root.campaignItems.map((item) => ({
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
      raw: root.raw.map((r) => ({
        fileId: r.fileId,
        rawText: r.rawText,
        inference: r.inference,
      })),
    };
  }

  static toListDto(roots: CampaignRoot[]): CampaignDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
