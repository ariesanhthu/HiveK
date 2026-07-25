import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import { SubscriptionDocument, SubscriptionModel } from '../schemas';
import { ISubscriptionReadService } from '@/application/interfaces/read-service';
import { Nullable } from '@/core/types';
import { SubscriptionResponseDto, SubscriptionFilterDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';
import { SubscriptionRoot } from '@/core/aggregate-roots';
import { PlanItemVO, AddonItemVO, GrantVO } from '@/core/value-objects';
import { SubscriptionMapper } from '@/application/mappers/subscription.mapper';

@Injectable()
export class MongoSubscriptionReadService implements ISubscriptionReadService {
  constructor(
    @InjectModel(SubscriptionModel.name)
    private readonly model: Model<SubscriptionDocument>,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  async findAll(filters: SubscriptionFilterDto = {}): Promise<PaginatedResponseDto<SubscriptionResponseDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, userId, status } = filters;
    const query: QueryFilter<SubscriptionDocument> = {};

    if (userId) {
      query.user_id = userId;
    }

    if (status) {
      query.status = status as any;
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

  async findById(id: string): Promise<Nullable<SubscriptionResponseDto>> {
    const cacheKey = CacheKeyUtil.id('subscription', id);
    const cached = await this.cacheService.get<SubscriptionResponseDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.model.findOne({ _id: id }).lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600); // Cache for 1 hour
    return dto;
  }

  async findByUserId(userId: string): Promise<Nullable<SubscriptionResponseDto>> {
    const cacheKey = CacheKeyUtil.custom('subscription', `userId:${userId}`);
    const cached = await this.cacheService.get<SubscriptionResponseDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.model.findOne({ user_id: userId }).lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  private mapToDto(doc: FlattenMaps<SubscriptionDocument>): SubscriptionResponseDto {
    const root = SubscriptionRoot.instantiate(
      doc._id.toString(),
      {
        userId: doc.user_id,
        status: doc.status as any,
        planItem: doc.plan_item
          ? new PlanItemVO({
              packageId: doc.plan_item.package_id,
              packageVariantId: doc.plan_item.package_variant_id,
              startDate: doc.plan_item.start_date,
              expiresAt: doc.plan_item.expires_at,
              billId: doc.plan_item.bill_id,
              autoRenew: doc.plan_item.auto_renew,
              price: doc.plan_item.price,
              priceAfterDiscount: doc.plan_item.price_after_discount,
            })
          : null,
        addonItems: (doc.addon_items || []).map(
          (item) =>
            new AddonItemVO({
              packageId: item.package_id,
              packageVariantId: item.package_variant_id,
              purchasedAt: item.purchased_at,
              expiresAt: item.expires_at,
              billId: item.bill_id,
              price: item.price,
              priceAfterDiscount: item.price_after_discount,
            })
        ),
        computedGrants: (doc.computed_grants || []).map(
          (g) =>
            new GrantVO({
              type: g.type as any,
              key: g.key,
              value: g.value,
              resetCycle: g.reset_cycle || undefined,
              creditFallback: g.credit_fallback
                ? {
                    creditType: g.credit_fallback.credit_type as any,
                    creditsPerUnit: g.credit_fallback.credits_per_unit,
                  }
                : g.credit_fallback === null
                ? null
                : undefined,
            })
        ),
        computedPermissions: doc.computed_permissions || [],
        version: doc.version || 1,
        nextExpiryCheckAt: doc.next_expiry_check_at,
        createdAt: doc.get('created_at'),
        updatedAt: doc.get('updated_at'),
      }
    );
    return SubscriptionMapper.toDto(root);
  }
}
