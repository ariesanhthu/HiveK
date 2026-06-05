import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignDocument, CampaignModel } from '../schemas';
import { ICampaignReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { CampaignDetailDto } from '@/application/dtos';
import { CampaignFilterDto } from '@/application/queries';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoCampaignReadService implements ICampaignReadService {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) { }

  async findAll(filters: CampaignFilterDto = {} as any): Promise<PaginatedResponseDto<CampaignDetailDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, name, ownerId, enterpriseId } = filters;
    const query: any = {};

    if (name) {
      query.description = { $regex: name, $options: 'i' };
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
      enterpriseId: doc.enterprise_id && typeof doc.enterprise_id === 'object' && doc.enterprise_id._id ? doc.enterprise_id._id.toString() : doc.enterprise_id?.toString() || null,
      budget: doc.budget,
      financialTarget: doc.financial_target instanceof Map ? Object.fromEntries(doc.financial_target) : doc.financial_target || {},
      description: doc.description || '',
      platformTarget: (doc.platform_target || []).map((p: any) => ({
        platformId: p.platformId,
        minFollowers: p.minFollowers,
        maxFollowers: p.maxFollowers,
        note: p.note,
        others: p.others instanceof Map ? Object.fromEntries(p.others) : p.others,
      })),
      status: doc.status,
      collaboratorIds: doc.collaborator_ids || [],
      rawContents: (doc.raw_contents || []).map((r: any) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
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
