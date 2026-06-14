import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { ICampaignProposalReadService } from '@/application/interfaces/read-service/proposal.read-service.interface';
import { ProposalDto, ProposalFilterDto } from '@/application/dtos';
import { CampaignProposalModel, CampaignProposalDocument } from '../schemas/campaign-proposal.schema';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { Nullable } from '@/core/types';

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

  async findAll(filters: ProposalFilterDto = {} as any): Promise<PaginatedResponseDto<ProposalDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, campaignId, status } = filters;
    const query: QueryFilter<CampaignProposalDocument> = {};

    if (campaignId) {
      query.campaign_id = new Types.ObjectId(campaignId) as any;
    }

    if (status) {
      query.status = status as any;
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
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  private mapToDto(doc: any): ProposalDto {
    return {
      id: doc._id.toString(),
      campaignId: doc.campaign_id?.toString() || '',
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      mediaSlides: (doc.media_slides || []).map((slide: any) => ({
        type: slide.type,
        fileId: slide.file_id,
        displayOrder: slide.display_order,
      })),
      products: (doc.products || []).map((product: any) => ({
        productId: product.product_id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        imageId: product.image_id,
        affiliateUrls: product.affiliate_urls instanceof Map
          ? Object.fromEntries(product.affiliate_urls)
          : (product.affiliate_urls || {}),
      })),
      vouchers: (doc.vouchers || []).map((voucher: any) => ({
        code: voucher.code,
        platform: voucher.platform,
        discountValue: voucher.discount_value,
        description: voucher.description,
        expirationDate: voucher.expiration_date,
      })),
      status: doc.status,
      metrics: doc.metrics instanceof Map
        ? Object.fromEntries(doc.metrics)
        : (doc.metrics || {}),
      createdAt: doc.created_at || doc.createdAt,
      updatedAt: doc.updated_at || doc.updatedAt,
    };
  }
}
