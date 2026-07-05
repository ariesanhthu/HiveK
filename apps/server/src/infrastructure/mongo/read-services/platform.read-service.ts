import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { PlatformDocument, PlatformModel } from '../schemas';
import { IPlatformReadService, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { PlatformDetailDto } from '@/application/dtos';
import { PlatformFilterDto } from '@/application/queries';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { MongoSanitizeUtil } from '../utils';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoPlatformReadService implements IPlatformReadService {
  private readonly domain = 'platform';

  constructor(
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) { }

  async findAll(filters: PlatformFilterDto = {} as any): Promise<PaginatedResponseDto<PlatformDetailDto>> {
    const cacheKey = CacheKeyUtil.list(this.domain, filters);
    const cached = await this.cacheService.get<PaginatedResponseDto<PlatformDetailDto>>(cacheKey);
    if (cached) return cached;

    const { cursor, limit = 10, sort = SortOrder.DESC, name, apiStatus } = filters;
    const query: QueryFilter<PlatformDocument> = {};

    if (name) {
      query.name = { $regex: MongoSanitizeUtil.escapeRegex(name), $options: 'i' };
    }

    if (apiStatus) {
      query.api_status = apiStatus;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.platformModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .populate('icon')
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

    // Cache list queries for 5 minutes
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  async findById(id: string): Promise<Nullable<PlatformDetailDto>> {
    const cacheKey = CacheKeyUtil.id(this.domain, id);
    const cached = await this.cacheService.get<PlatformDetailDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.platformModel.findById(id).populate('icon').lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    // Cache details for 1 hour
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  async findByName(name: string): Promise<Nullable<PlatformDetailDto>> {
    const cacheKey = CacheKeyUtil.custom(this.domain, `name:${name.toLowerCase()}`);
    const cached = await this.cacheService.get<PlatformDetailDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.platformModel.findOne({ name: name.toLowerCase() }).populate('icon').lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    // Cache details for 1 hour
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  private mapToDto(doc: any): PlatformDetailDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      baseUrl: doc.base_url,
      apiStatus: doc.api_status,
      icon: doc.icon && typeof doc.icon === 'object' && doc.icon._id ? {
        id: doc.icon._id.toString(),
        url: doc.icon.url,
        publicId: doc.icon.public_id,
        size: doc.icon.size,
        format: doc.icon.format,
        title: doc.icon.title,
        targetType: doc.icon.target_type,
        targetId: doc.icon.target_id,
        targetField: doc.icon.target_field,
        createdAt: doc.icon.created_at,
        updatedAt: doc.icon.updated_at,
      } : null,
    };
  }
}