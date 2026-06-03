import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignDocument, CampaignModel } from '../schemas';
import { ICampaignReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { CampaignDetailDto, CampaignDto } from '@/application/dtos';
import { CampaignFilterDto } from '@/application/queries';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoCampaignReadService implements ICampaignReadService {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) { }

  async findAll(filters: CampaignFilterDto = {} as any): Promise<PaginatedResponseDto<CampaignDetailDto>> {
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
      .populate('owner_id')
      .populate('enterprise_id')
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

  async findById(id: string): Promise<Nullable<CampaignDetailDto>> {
    const doc = await this.campaignModel.findById(id).populate('owner_id').populate('enterprise_id').lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: any): CampaignDetailDto {
    return {
      id: doc._id.toString(),
      ownerId: doc.owner_id && typeof doc.owner_id === 'object' && doc.owner_id._id ? doc.owner_id._id.toString() : doc.owner_id?.toString() || '',
      enterpriseId: doc.enterprise_id && typeof doc.enterprise_id === 'object' && doc.enterprise_id._id ? doc.enterprise_id._id.toString() : doc.enterprise_id?.toString() || '',
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
      owner: doc.owner_id && typeof doc.owner_id === 'object' && doc.owner_id._id ? {
        id: doc.owner_id._id.toString(),
        email: doc.owner_id.email,
        phone: doc.owner_id.phone,
        fullName: doc.owner_id.full_name,
        roleId: doc.owner_id.role_id ? doc.owner_id.role_id.toString() : '',
        isEmailVerified: doc.owner_id.is_email_verified,
        type: doc.owner_id.type,
        createdAt: doc.owner_id.created_at,
        updatedAt: doc.owner_id.updated_at,
      } as any : undefined,
      enterprise: doc.enterprise_id && typeof doc.enterprise_id === 'object' && doc.enterprise_id._id ? {
        id: doc.enterprise_id._id.toString(),
        userId: doc.enterprise_id.user_id ? doc.enterprise_id.user_id.toString() : '',
        companyName: doc.enterprise_id.company_name,
        description: doc.enterprise_id.description,
        contactEmail: doc.enterprise_id.contact_email,
        contactPhone: doc.enterprise_id.contact_phone,
        website: doc.enterprise_id.website,
        taxId: doc.enterprise_id.tax_id,
        logoUrlId: doc.enterprise_id.logo_url_id,
        isVerified: doc.enterprise_id.is_verified,
        createdAt: doc.enterprise_id.created_at,
        updatedAt: doc.enterprise_id.updated_at,
      } : undefined,
    };
  }
}
