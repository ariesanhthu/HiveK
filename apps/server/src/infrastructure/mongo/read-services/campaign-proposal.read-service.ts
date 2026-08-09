import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter, Types } from 'mongoose';
import { ICampaignProposalReadService } from '@/application/interfaces/read-service/proposal.read-service.interface';
import { ProposalDto, ProposalFilterDto } from '@/application/dtos';
import {
  CampaignProposalModel,
  CampaignProposalDocument,
} from '../schemas/campaign-proposal.schema';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';
import { Nullable } from '@/core/types';
import { EMediaSlideType, EProductPlatform } from '@/core/enums';

@Injectable()
export class MongoCampaignProposalReadService implements ICampaignProposalReadService {
  constructor(
    @InjectModel(CampaignProposalModel.name)
    private readonly proposalModel: Model<CampaignProposalDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<ProposalDto>> {
    const doc = await this.proposalModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findBySlug(slug: string): Promise<Nullable<ProposalDto>> {
    const doc = await this.proposalModel.findOne({ slug }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(
    filters: ProposalFilterDto = {},
  ): Promise<PaginatedResponseDto<ProposalDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      campaignId,
      status,
    } = filters;
    const query: QueryFilter<CampaignProposalDocument> = {};

    if (campaignId) {
      query.campaign_id = new Types.ObjectId(campaignId);
    }

    if (status) {
      query.status = status;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.proposalModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage
      ? results[results.length - 1]._id.toString()
      : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  private mapToDto(doc: FlattenMaps<CampaignProposalDocument>): ProposalDto {
    return {
      id: doc._id.toString(),
      campaignId: doc.campaign_id?.toString() || '',
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      mediaSlides: (doc.media_slides || []).map(
        (slide: Record<string, unknown>) => ({
          type: slide.type as EMediaSlideType,
          fileId: slide.file_id as string,
          displayOrder: slide.display_order as number,
        }),
      ),
      products: (doc.products || []).map(
        (product: Record<string, unknown>) => ({
          productId: product.product_id as string,
          name: product.name as string,
          price: product.price as number,
          currency: product.currency as string,
          imageId: product.image_id as string,
          affiliateUrls:
            product.affiliate_urls instanceof Map
              ? Object.fromEntries(product.affiliate_urls)
              : product.affiliate_urls || {},
        }),
      ),
      vouchers: (doc.vouchers || []).map(
        (voucher: Record<string, unknown>) => ({
          code: voucher.code as string,
          platform: voucher.platform as EProductPlatform,
          discountValue: voucher.discount_value as string,
          description: voucher.description as string,
          expirationDate:
            voucher.expiration_date instanceof Date
              ? voucher.expiration_date.toISOString()
              : new Date(
                  voucher.expiration_date as string | number | Date,
                ).toISOString(),
        }),
      ),
      status: doc.status,
      metrics:
        doc.metrics instanceof Map
          ? Object.fromEntries(doc.metrics)
          : doc.metrics || {},
      createdAt:
        doc.created_at instanceof Date
          ? doc.created_at.toISOString()
          : new Date(doc.created_at).toISOString(),
      updatedAt:
        doc.updated_at instanceof Date
          ? doc.updated_at.toISOString()
          : new Date(doc.updated_at).toISOString(),
    };
  }
}
