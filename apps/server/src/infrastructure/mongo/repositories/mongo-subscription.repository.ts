import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { ISubscriptionRepository } from '@/core/interfaces/repositories';
import { SubscriptionEntity } from '@/core/aggregate-roots';
import { SubscriptionItemVO, QuotaVO } from '@/core/value-objects';
import { SubscriptionModel, SubscriptionDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

function quotaPropsFromUnknown(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[k] = v;
    }
  }
  return out;
}

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

  async findById(id: string): Promise<Nullable<SubscriptionEntity>> {
    const doc = await this.subscriptionModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(subscription: SubscriptionEntity): Promise<void> {
    const data = this.mapToPersistence(subscription);

    if (!subscription.id) {
      const created = new this.subscriptionModel(data);
      const saved = await created.save({ session: this.session });
      subscription.setId(saved._id.toString());
    } else {
      await this.subscriptionModel.findByIdAndUpdate(subscription.id, data, { upsert: true }).session(this.session).exec();
    }

    await this.invalidateCache(subscription.id!, subscription.enterpriseId);
  }

  async saveMany(subscriptions: SubscriptionEntity[]): Promise<void> {
    await Promise.all(subscriptions.map(s => this.save(s)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.subscriptionModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.subscriptionModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.enterprise_id);
    }
  }

  private async invalidateCache(id: string, enterpriseId: string): Promise<void> {
    const domain = 'subscription';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (enterpriseId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `enterpriseId:${enterpriseId}`)));
    }
    await Promise.all(invalidations);
  }

  async findByEnterpriseId(enterpriseId: string): Promise<Nullable<SubscriptionEntity>> {
    const doc = await this.subscriptionModel.findOne({ enterprise_id: enterpriseId }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async existsByPackageId(packageId: string): Promise<boolean> {
    const count = await this.subscriptionModel.countDocuments({
      'items.package_id': packageId,
    }).session(this.session).exec();
    return count > 0;
  }

  async updateWithVersion(
    id: string,
    expectedVersion: number,
    entity: SubscriptionEntity
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
    await this.invalidateCache(id, entity.enterpriseId);
  }

  private mapToDomain(doc: SubscriptionDocument): SubscriptionEntity {
    return SubscriptionEntity.instantiate(
      doc._id.toString(),
      {
        enterpriseId: doc.enterprise_id,
        status: doc.status,
        items: (doc.items || []).map(
          (item) =>
            new SubscriptionItemVO({
              packageId: item.package_id,
              packageVariantId: item.package_variant_id,
              startDate: item.start_date,
              expiresAt: item.expires_at,
              billId: item.bill_id,
            })
        ),
        computedQuotas: new QuotaVO(quotaPropsFromUnknown(doc.computed_quotas)),
        computedPermissions: doc.computed_permissions || [],
        version: doc.version || 1,
        nextExpiryCheckAt: doc.next_expiry_check_at,
        createdAt: doc.get('created_at'),
        updatedAt: doc.get('updated_at'),
      }
    );
  }

  private mapToPersistence(data: SubscriptionEntity): Omit<SubscriptionModel, 'created_at' | 'updated_at'> {
    return {
      enterprise_id: data.enterpriseId,
      status: data.status,
      items: data.items.map((item) => ({
        package_id: item.packageId,
        package_variant_id: item.packageVariantId,
        start_date: item.startDate,
        expires_at: item.expiresAt,
        bill_id: item.billId,
      })),
      computed_quotas: data.computedQuotas.unmarshal,
      computed_permissions: data.computedPermissions,
      version: data.version,
      next_expiry_check_at: data.nextExpiryCheckAt,
    };
  }
}
