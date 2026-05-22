import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignDocument, CampaignModel } from '../schemas';
import { ICampaignReadService } from '@/application/interfaces';
import { Nullable } from '@/shared/types';
import { CampaignDto, CampaignFilterDto } from '@/application/campaigns/dtos';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoCampaignReadService implements ICampaignReadService {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  async findAll(filters: CampaignFilterDto = {} as any): Promise<PaginatedResponseDto<CampaignDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, name, type, ownerId, enterpriseId } = filters;
    const query: any = {};

    if (name) {
      query['campaign.name'] = { $regex: name, $options: 'i' };
    }

    if (type) {
      query['campaign.type'] = type;
    }

    if (ownerId) {
      query.owner_id = ownerId;
    }

    if (enterpriseId) {
      query.enterprise_id = enterpriseId;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.campaignModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
    );
  }

  async findById(id: string): Promise<Nullable<CampaignDto>> {
    const doc = await this.campaignModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: any): CampaignDto {
    return {
      id: doc._id.toString(),
      ownerId: doc.owner_id.toString(),
      enterpriseId: doc.enterprise_id.toString(),
      campaign: {
        name: doc.campaign.name,
        type: doc.campaign.type,
        startDate: doc.campaign.start_date.toISOString(),
        endDate: doc.campaign.end_date.toISOString(),
        objective: doc.campaign.objective,
        description: doc.campaign.description,
      },
      targeting: {
        audience: {
          ageRange: doc.targeting.audience.age_range,
          interests: doc.targeting.audience.interests,
        },
        locations: doc.targeting.locations,
      },
      campaignItems: doc.campaign_items.map((item: any) => ({
        product: {
          name: item.product.name,
          category: item.product.category,
          brand: item.product.brand,
          description: item.product.description,
          features: item.product.features || [],
          keywords: item.product.keywords || [],
          priceSegment: item.product.price_segment,
        },
        marketing: {
          angle: item.marketing.angle || [],
          contentStyle: item.marketing.content_style || [],
          tone: item.marketing.tone || [],
          keyMessages: item.marketing.key_messages || [],
        },
        pricing: {
          originalPrice: item.pricing.original_price,
          salePrice: item.pricing.sale_price,
          currency: item.pricing.currency,
        },
        promotion: {
          type: item.promotion.type,
          value: item.promotion.value,
          unit: item.promotion.unit,
        },
        channels: (item.channels || []).map((chan: any) => ({
          type: chan.type,
          platform: chan.platform,
          url: chan.url,
        })),
      })),
      raw: (doc.raw || []).map((r: any) => ({
        fileId: r.file_id,
        rawText: r.raw_text,
        inference: r.inference || '',
      })),
    };
  }
}
