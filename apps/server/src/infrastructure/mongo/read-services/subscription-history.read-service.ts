import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import { SubscriptionHistoryDocument, SubscriptionHistoryModel } from '../schemas';
import { ISubscriptionHistoryReadService } from '@/application/interfaces/read-service';
import { SubscriptionHistoryResponseDto, SubscriptionHistoryFilterDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { SubscriptionHistoryEntity } from '@/core/aggregate-roots';
import { SubscriptionChangeDetailsVO, GrantVO } from '@/core/value-objects';
import { SubscriptionMapper } from '@/application/mappers/subscription.mapper';

@Injectable()
export class MongoSubscriptionHistoryReadService implements ISubscriptionHistoryReadService {
  constructor(
    @InjectModel(SubscriptionHistoryModel.name)
    private readonly model: Model<SubscriptionHistoryDocument>,
  ) {}

  async findById(id: string): Promise<SubscriptionHistoryResponseDto | null> {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) return null;
    return this.mapToDto(doc);
  }

  async findAll(filters: SubscriptionHistoryFilterDto = {}): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, userId, subscriptionId } = filters;
    const query: QueryFilter<SubscriptionHistoryDocument> = {};

    if (userId) {
      query.user_id = userId;
    }

    if (subscriptionId) {
      query.subscription_id = subscriptionId;
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

  async findBySubscriptionId(subscriptionId: string, filters: SubscriptionHistoryFilterDto = {}): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
    return this.findAll({ ...filters, subscriptionId });
  }

  async findByUserId(userId: string, filters: SubscriptionHistoryFilterDto = {}): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
    return this.findAll({ ...filters, userId });
  }

  private mapToDto(doc: FlattenMaps<SubscriptionHistoryDocument>): SubscriptionHistoryResponseDto {
    const entity = SubscriptionHistoryEntity.instantiate(
      doc._id.toString(),
      {
        userId: doc.user_id,
        subscriptionId: doc.subscription_id,
        billId: doc.bill_id,
        actorId: doc.actor_id,
        details: new SubscriptionChangeDetailsVO({
          oldPlanId: doc.details.old_plan_id,
          newPlanId: doc.details.new_plan_id,
          addedAddonIds: doc.details.added_addon_ids,
          removedAddonIds: doc.details.removed_addon_ids,
          oldGrants: doc.details.old_grants.map(g => new GrantVO({
            type: g.type as any,
            key: g.key,
            value: g.value,
            resetCycle: g.reset_cycle || undefined,
            creditFallback: g.credit_fallback ? {
              creditType: g.credit_fallback.credit_type as any,
              creditsPerUnit: g.credit_fallback.credits_per_unit,
            } : undefined
          })),
          newGrants: doc.details.new_grants.map(g => new GrantVO({
            type: g.type as any,
            key: g.key,
            value: g.value,
            resetCycle: g.reset_cycle || undefined,
            creditFallback: g.credit_fallback ? {
              creditType: g.credit_fallback.credit_type as any,
              creditsPerUnit: g.credit_fallback.credits_per_unit,
            } : undefined
          })),
          oldPermissions: doc.details.old_permissions,
          newPermissions: doc.details.new_permissions,
        }),
        createdAt: doc.get('created_at'),
      }
    );
    return SubscriptionMapper.toHistoryDto(entity);
  }
}
