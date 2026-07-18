import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { ISubscriptionRepository } from '@/core/interfaces/repositories';
import { SubscriptionRoot } from '@/core/aggregate-roots';
import { PlanItemVO, AddonItemVO, GrantVO } from '@/core/value-objects';
import { SubscriptionModel, SubscriptionDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoSubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @InjectModel(SubscriptionModel.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<SubscriptionRoot>> {
    const doc = await this.subscriptionModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(subscription: SubscriptionRoot): Promise<void> {
    const data = this.mapToPersistence(subscription);

    if (!subscription.id) {
      const created = new this.subscriptionModel(data);
      const saved = await created.save({ session: this.session });
      subscription.setId(saved._id.toString());
    } else {
      await this.subscriptionModel.findByIdAndUpdate(subscription.id, data, { upsert: true }).session(this.session).exec();
    }

    await this.invalidateCache(subscription.id!, subscription.userId);
  }

  async saveMany(subscriptions: SubscriptionRoot[]): Promise<void> {
    await Promise.all(subscriptions.map(s => this.save(s)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.subscriptionModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.subscriptionModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.user_id);
    }
  }

  private async invalidateCache(id: string, userId: string): Promise<void> {
    const domain = 'subscription';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (userId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `userId:${userId}`)));
    }
    await Promise.all(invalidations);
  }

  async findByUserId(userId: string): Promise<Nullable<SubscriptionRoot>> {
    const doc = await this.subscriptionModel.findOne({ user_id: userId }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async existsByPackageId(packageId: string): Promise<boolean> {
    const count = await this.subscriptionModel.countDocuments({
      $or: [
        { 'plan_item.package_id': packageId },
        { 'addon_items.package_id': packageId },
      ],
    }).session(this.session).exec();
    return count > 0;
  }

  async findExpiredSubscriptions(now: Date): Promise<SubscriptionRoot[]> {
    const docs = await this.subscriptionModel.find({
      'plan_item.expires_at': { $lte: now },
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async updateWithVersion(
    id: string,
    expectedVersion: number,
    entity: SubscriptionRoot
  ): Promise<void> {
    const { version: _version, ...plain } = this.mapToPersistence(entity);

    const result = await this.subscriptionModel.updateOne(
      { _id: id, version: expectedVersion },
      { $set: plain, $inc: { version: 1 } },
      this.session !== undefined ? { session: this.session } : {}
    );

    if (result.modifiedCount === 0) {
      throw new Error('OptimisticLockException: Subscription version conflict');
    }
    await this.invalidateCache(id, entity.userId);
  }

  private mapToDomain(doc: SubscriptionDocument): SubscriptionRoot {
    return SubscriptionRoot.instantiate(
      doc._id.toString(),
      {
        userId: doc.user_id,
        status: doc.status,
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
        ),
        computedPermissions: doc.computed_permissions || [],
        version: doc.version || 1,
        nextExpiryCheckAt: doc.next_expiry_check_at,
        createdAt: doc.get('created_at'),
        updatedAt: doc.get('updated_at'),
      }
    );
  }

  private mapToPersistence(data: SubscriptionRoot): Omit<SubscriptionModel, 'created_at' | 'updated_at'> {
    return {
      user_id: data.userId,
      status: data.status,
      plan_item: data.planItem
        ? {
            package_id: data.planItem.packageId,
            package_variant_id: data.planItem.packageVariantId,
            start_date: data.planItem.startDate,
            expires_at: data.planItem.expiresAt,
            bill_id: data.planItem.billId,
            auto_renew: data.planItem.autoRenew,
            price: data.planItem.price,
            price_after_discount: data.planItem.priceAfterDiscount,
          }
        : null,
      addon_items: data.addonItems.map((item) => ({
        package_id: item.packageId,
        package_variant_id: item.packageVariantId,
        purchased_at: item.purchasedAt,
        expires_at: item.expiresAt,
        bill_id: item.billId,
        price: item.price,
        price_after_discount: item.priceAfterDiscount,
      })),
      computed_grants: data.computedGrants.map((g) => ({
        type: g.type,
        key: g.key,
        value: g.value,
        reset_cycle: g.resetCycle ?? null,
        credit_fallback: g.creditFallback
          ? {
              credit_type: g.creditFallback.creditType,
              credits_per_unit: g.creditFallback.creditsPerUnit,
            }
          : null,
      })),
      computed_permissions: data.computedPermissions,
      version: data.version,
      next_expiry_check_at: data.nextExpiryCheckAt,
    };
  }
}