import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import { QuotaUsageDocument, QuotaUsageModel } from '../schemas';
import { IQuotaUsageReadService } from '@/application/interfaces/read-service';
import { QuotaUsageResponseDto, QuotaUsageFilterDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';
import { Nullable } from '@/core/types';

@Injectable()
export class MongoQuotaUsageReadService implements IQuotaUsageReadService {
  constructor(
    @InjectModel(QuotaUsageModel.name)
    private readonly model: Model<QuotaUsageDocument>,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  async findById(id: string): Promise<QuotaUsageResponseDto | null> {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) return null;
    return this.mapToDto(doc);
  }

  async findAll(filters: QuotaUsageFilterDto = {}): Promise<PaginatedResponseDto<QuotaUsageResponseDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, enterpriseId } = filters;
    const query: QueryFilter<QuotaUsageDocument> = {};

    if (enterpriseId) {
      query.enterprise_id = enterpriseId;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.model
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

  async findByEnterpriseId(enterpriseId: string): Promise<Nullable<QuotaUsageResponseDto>> {
    const cacheKey = CacheKeyUtil.custom('quota-usage', `enterpriseId:${enterpriseId}`);
    const cached = await this.cacheService.get<QuotaUsageResponseDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.model.findOne({ enterprise_id: enterpriseId }).lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  private mapToDto(doc: FlattenMaps<QuotaUsageDocument>): QuotaUsageResponseDto {
    const updatedAt = doc.updated_at || doc.get?.('updated_at');
    return {
      id: doc._id.toString(),
      enterpriseId: doc.enterprise_id,
      cycleAnchorDate: doc.cycle_anchor_date instanceof Date ? doc.cycle_anchor_date.toISOString() : new Date(doc.cycle_anchor_date).toISOString(),
      usages: (doc.usages || []).map(u => ({
        key: u.key,
        allocated: u.allocated,
        used: u.used,
        cycleStartAt: u.cycle_start_at instanceof Date ? u.cycle_start_at.toISOString() : new Date(u.cycle_start_at).toISOString(),
        cycleEndsAt: u.cycle_ends_at instanceof Date ? u.cycle_ends_at.toISOString() : new Date(u.cycle_ends_at).toISOString(),
      })),
      updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : new Date(updatedAt).toISOString(),
    };
  }
}
