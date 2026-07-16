import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { IEnterpriseReadService, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { EnterpriseModel, type EnterpriseDocument } from '../schemas/enterprise.schema';
import { Nullable } from '@/core/types';
import { EnterpriseDetailDto } from '@/application/dtos';
import { EnterpriseFilterDto } from '@/application/queries/enterprise-get-list/enterprise-get-list.dto';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { MongoSanitizeUtil } from '../utils';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoEnterpriseReadService implements IEnterpriseReadService {
  private readonly domain = 'enterprise';

  constructor(
    @InjectModel(EnterpriseModel.name)
    private readonly enterpriseModel: Model<EnterpriseDocument>,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) { }

  async findById(id: string): Promise<Nullable<EnterpriseDetailDto>> {
    const cacheKey = CacheKeyUtil.id(this.domain, id);
    const cached = await this.cacheService.get<EnterpriseDetailDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.enterpriseModel.findById(id).populate('user_id').populate('logo_url_id').lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  async findByUserId(userId: string): Promise<Nullable<EnterpriseDetailDto>> {
    const cacheKey = CacheKeyUtil.custom(this.domain, `userId:${userId}`);
    const cached = await this.cacheService.get<EnterpriseDetailDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.enterpriseModel.findOne({ user_id: new Types.ObjectId(userId) }).populate('user_id').populate('logo_url_id').lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  async findAll(filters: EnterpriseFilterDto = {}): Promise<PaginatedResponseDto<EnterpriseDetailDto>> {
    const cacheKey = CacheKeyUtil.list(this.domain, filters);
    const cached = await this.cacheService.get<PaginatedResponseDto<EnterpriseDetailDto>>(cacheKey);
    if (cached) return cached;

    const { cursor, limit = 10, sort = SortOrder.DESC, companyName, contactEmail, taxId, isVerified } = filters;
    const query: QueryFilter<EnterpriseDocument> = {};

    if (companyName) {
      query.company_name = { $regex: MongoSanitizeUtil.escapeRegex(companyName), $options: 'i' };
    }
    if (contactEmail) {
      query.contact_email = { $regex: MongoSanitizeUtil.escapeRegex(contactEmail), $options: 'i' };
    }
    if (taxId) {
      query.tax_id = taxId;
    }
    if (isVerified !== undefined) {
      query.is_verified = isVerified;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.enterpriseModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .populate('user_id')
      .populate('logo_url_id')
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    const response = new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  private mapToDto(doc: any): EnterpriseDetailDto {
    return {
      id: doc._id.toString(),
      userId: doc.user_id && typeof doc.user_id === 'object' && doc.user_id._id ? doc.user_id._id.toString() : doc.user_id?.toString() || '',
      companyName: doc.company_name,
      description: doc.description,
      contactEmail: doc.contact_email,
      contactPhone: doc.contact_phone,
      website: doc.website,
      taxId: doc.tax_id,
      logoUrlId: doc.logo_url_id && typeof doc.logo_url_id === 'object' && doc.logo_url_id._id ? {
        id: doc.logo_url_id._id.toString(),
        url: doc.logo_url_id.url,
        publicId: doc.logo_url_id.public_id,
        size: doc.logo_url_id.size,
        format: doc.logo_url_id.format,
        title: doc.logo_url_id.title,
        targetType: doc.logo_url_id.target_type,
        targetId: doc.logo_url_id.target_id,
        targetField: doc.logo_url_id.target_field,
        createdAt: doc.logo_url_id.created_at,
        updatedAt: doc.logo_url_id.updated_at,
      } : null,
      isVerified: doc.is_verified,
      members: (doc.members || []).map((m: any) => ({
        userId: m.user_id ? m.user_id.toString() : '',
        mode: m.mode,
      })),
      knowledgeBase: doc.knowledge_base ? {
        rawText: doc.knowledge_base.raw_text,
        externalLinks: doc.knowledge_base.external_links || [],
        updatedAt: doc.knowledge_base.updated_at ? new Date(doc.knowledge_base.updated_at).toISOString() : new Date().toISOString(),
      } : undefined,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      user: doc.user_id && typeof doc.user_id === 'object' && doc.user_id._id ? {
        id: doc.user_id._id.toString(),
        email: doc.user_id.email,
        phone: doc.user_id.phone,
        fullName: doc.user_id.full_name,
        roleId: doc.user_id.role_id ? doc.user_id.role_id.toString() : '',
        isEmailVerified: doc.user_id.is_email_verified,
        type: doc.user_id.type,
        createdAt: doc.user_id.created_at,
        updatedAt: doc.user_id.updated_at,
      } : undefined,
    };
  }
}
