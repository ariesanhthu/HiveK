import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { ISubscriptionHistoryRepository } from '@/core/interfaces/repositories';
import { SubscriptionHistoryEntity } from '@/core/aggregate-roots';
import { SubscriptionHistoryModel, SubscriptionHistoryDocument, GrantSchema } from '../schemas';
import { SubscriptionChangeDetailsVO, GrantVO } from '@/core/value-objects';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoSubscriptionHistoryRepository implements ISubscriptionHistoryRepository {
  constructor(
    @InjectModel(SubscriptionHistoryModel.name)
    private readonly historyModel: Model<SubscriptionHistoryDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<SubscriptionHistoryEntity>> {
    const doc = await this.historyModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(history: SubscriptionHistoryEntity): Promise<void> {
    const data = this.mapToPersistence(history);

    if (!history.id) {
      const created = new this.historyModel(data);
      const saved = await created.save({ session: this.session });
      history.setId(saved._id.toString());
    } else {
      await this.historyModel.findByIdAndUpdate(history.id, data, { upsert: true }).session(this.session).exec();
    }

    await this.invalidateCache(history.id!, history.userId);
  }

  async saveMany(histories: SubscriptionHistoryEntity[]): Promise<void> {
    await Promise.all(histories.map(h => this.save(h)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.historyModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.historyModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.user_id);
    }
  }

  private async invalidateCache(id: string, userId: string): Promise<void> {
    const domain = 'subscription-history';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (userId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `userId:${userId}`)));
    }
    await Promise.all(invalidations);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<SubscriptionHistoryEntity[]> {
    const docs = await this.historyModel.find({ subscription_id: subscriptionId }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByUserId(userId: string): Promise<SubscriptionHistoryEntity[]> {
    const docs = await this.historyModel.find({ user_id: userId }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  private mapToDomain(doc: SubscriptionHistoryDocument): SubscriptionHistoryEntity {
    const details = doc.details;
    const mapGrantsList = (grantsList: GrantSchema[] | null | undefined): GrantVO[] => {
      return (grantsList || []).map(
        (g) =>
          new GrantVO({
            type: g.type,
            key: g.key,
            value: g.value,
            resetCycle: g.reset_cycle || undefined,
            creditFallback: g.credit_fallback
              ? {
                  creditType: g.credit_fallback.credit_type,
                  creditsPerUnit: g.credit_fallback.credits_per_unit,
                }
              : g.credit_fallback === null
              ? null
              : undefined,
          })
      );
    };

    return SubscriptionHistoryEntity.instantiate(
      doc._id.toString(),
      {
        userId: doc.user_id,
        subscriptionId: doc.subscription_id,
        billId: doc.bill_id,
        actorId: doc.actor_id,
        details: new SubscriptionChangeDetailsVO({
          oldPlanId: details.old_plan_id || null,
          newPlanId: details.new_plan_id || null,
          addedAddonIds: details.added_addon_ids || [],
          removedAddonIds: details.removed_addon_ids || [],
          oldGrants: mapGrantsList(details.old_grants),
          newGrants: mapGrantsList(details.new_grants),
          oldPermissions: details.old_permissions || [],
          newPermissions: details.new_permissions || [],
        }),
        createdAt: doc.get('created_at'),
      }
    );
  }

  private mapToPersistence(data: SubscriptionHistoryEntity): Omit<SubscriptionHistoryModel, 'created_at'> {
    const mapGrantsToSchema = (grantsList: GrantVO[]) => {
      return grantsList.map((g) => ({
        type: g.type,
        key: g.key,
        value: g.value,
        reset_cycle: g.resetCycle ?? null,
        credit_fallback: g.creditFallback
          ? {
              credit_type: g.creditFallback.creditType,
              credits_per_unit: g.creditFallback.creditsPerUnit,
            }
          : g.creditFallback === null
          ? null
          : null,
      }));
    };

    return {
      user_id: data.userId,
      subscription_id: data.subscriptionId,
      bill_id: data.billId,
      actor_id: data.actorId,
      details: {
        old_plan_id: data.details.oldPlanId,
        new_plan_id: data.details.newPlanId,
        added_addon_ids: data.details.addedAddonIds,
        removed_addon_ids: data.details.removedAddonIds,
        old_grants: mapGrantsToSchema(data.details.oldGrants),
        new_grants: mapGrantsToSchema(data.details.newGrants),
        old_permissions: data.details.oldPermissions,
        new_permissions: data.details.newPermissions,
      },
    };
  }
}
