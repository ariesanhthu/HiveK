import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import {
  EnterpriseQuotaAllocationDocument,
  EnterpriseQuotaAllocationModel,
} from '../schemas';
import { IEnterpriseQuotaAllocationReadService } from '@/application/interfaces/read-service';
import {
  EnterpriseQuotaAllocationResponseDto,
  EnterpriseQuotaAllocationFilterDto,
} from '@/application/dtos';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';
import { CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';
import { Nullable } from '@/core/types';
import { EGrantType } from '@/core/enums';

@Injectable()
export class MongoEnterpriseQuotaAllocationReadService implements IEnterpriseQuotaAllocationReadService {
  constructor(
    @InjectModel(EnterpriseQuotaAllocationModel.name)
    private readonly model: Model<EnterpriseQuotaAllocationDocument>,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  async findById(
    id: string,
  ): Promise<EnterpriseQuotaAllocationResponseDto | null> {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) return null;
    return this.mapToDto(doc);
  }

  async findAll(
    filters: EnterpriseQuotaAllocationFilterDto = {},
  ): Promise<PaginatedResponseDto<EnterpriseQuotaAllocationResponseDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, ownerId } = filters;
    const query: QueryFilter<EnterpriseQuotaAllocationDocument> = {};

    if (ownerId) {
      query.owner_id = ownerId;
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

  async findByOwnerId(
    ownerId: string,
  ): Promise<Nullable<EnterpriseQuotaAllocationResponseDto>> {
    const cacheKey = CacheKeyUtil.custom(
      'enterprise-quota-allocation',
      `ownerId:${ownerId}`,
    );
    const cached =
      await this.cacheService.get<EnterpriseQuotaAllocationResponseDto>(
        cacheKey,
      );
    if (cached) return cached;

    const doc = await this.model.findOne({ owner_id: ownerId }).lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  private mapToDto(
    doc: FlattenMaps<EnterpriseQuotaAllocationDocument>,
  ): EnterpriseQuotaAllocationResponseDto {
    const updatedAt = doc.updated_at || doc.get?.('updated_at');
    return {
      id: doc._id.toString(),
      ownerId: doc.owner_id,
      allocations: (doc.allocations || []).map((a) => ({
        enterpriseId: a.enterprise_id,
        key: a.key,
        allocated: a.allocated,
        kind: a.kind,
        isPool: a.is_pool,
      })),
      updatedAt:
        updatedAt instanceof Date
          ? updatedAt.toISOString()
          : new Date(updatedAt || Date.now()).toISOString(),
    };
  }
}
