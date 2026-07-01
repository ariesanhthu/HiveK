import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { ISubscriptionHistoryRepository } from '@/core/interfaces/repositories';
import { SubscriptionHistoryEntity } from '@/core/aggregate-roots';
import { SubscriptionHistoryModel, SubscriptionHistoryDocument, SubscriptionChangeDetailsModel } from '../schemas';
import { SubscriptionChangeDetailsVO, QuotaVO } from '@/core/value-objects';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

function stringArrayFromUnknown(value: unknown): string[] {
  return Array.isArray(value) && value.every((x): x is string => typeof x === 'string')
    ? value
    : [];
}

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

function subscriptionChangeDetailsPropsFromMongo(
  details: SubscriptionChangeDetailsModel | Record<string, unknown> | null | undefined
): any {
  const d = details ?? {};
  return {
    oldPackages: stringArrayFromUnknown((d as any).oldPackages),
    newPackages: stringArrayFromUnknown((d as any).newPackages),
    oldQuotas: new QuotaVO(quotaPropsFromUnknown((d as any).oldQuotas)),
    newQuotas: new QuotaVO(quotaPropsFromUnknown((d as any).newQuotas)),
    oldPermissions: stringArrayFromUnknown((d as any).oldPermissions),
    newPermissions: stringArrayFromUnknown((d as any).newPermissions),
  };
}

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

    await this.invalidateCache(history.id!, history.enterpriseId);
  }

  async saveMany(histories: SubscriptionHistoryEntity[]): Promise<void> {
    await Promise.all(histories.map(h => this.save(h)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.historyModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.historyModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.enterprise_id);
    }
  }

  private async invalidateCache(id: string, enterpriseId: string): Promise<void> {
    const domain = 'subscription-history';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (enterpriseId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `enterpriseId:${enterpriseId}`)));
    }
    await Promise.all(invalidations);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<SubscriptionHistoryEntity[]> {
    const docs = await this.historyModel.find({ subscription_id: subscriptionId }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByEnterpriseId(enterpriseId: string): Promise<SubscriptionHistoryEntity[]> {
    const docs = await this.historyModel.find({ enterprise_id: enterpriseId }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  private mapToDomain(doc: SubscriptionHistoryDocument): SubscriptionHistoryEntity {
    return SubscriptionHistoryEntity.instantiate(
      doc._id.toString(),
      {
        enterpriseId: doc.enterprise_id,
        subscriptionId: doc.subscription_id,
        billId: doc.bill_id,
        actorId: doc.actor_id,
        details: new SubscriptionChangeDetailsVO(
          subscriptionChangeDetailsPropsFromMongo(doc.details)
        ),
        createdAt: doc.get('created_at'),
      }
    );
  }

  private mapToPersistence(data: SubscriptionHistoryEntity): Omit<SubscriptionHistoryModel, 'created_at'> {
    return {
      enterprise_id: data.enterpriseId,
      subscription_id: data.subscriptionId,
      bill_id: data.billId,
      actor_id: data.actorId,
      details: {
        oldPackages: data.details.oldPackages,
        newPackages: data.details.newPackages,
        oldQuotas: data.details.oldQuotas.unmarshal,
        newQuotas: data.details.newQuotas.unmarshal,
        oldPermissions: data.details.oldPermissions,
        newPermissions: data.details.newPermissions,
      },
    };
  }
}
