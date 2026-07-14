import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Aggregate } from 'mongoose';
import type { IQuotaUsageRepository } from '@/core/interfaces/repositories';
import { QuotaUsageRoot } from '@/core/aggregate-roots';
import { QuotaUsageModel, QuotaUsageDocument } from '../schemas';
import { RenewableUsageVO } from '@/core/value-objects';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoQuotaUsageRepository implements IQuotaUsageRepository {
  constructor(
    @InjectModel(QuotaUsageModel.name)
    private readonly usageModel: Model<QuotaUsageDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<QuotaUsageRoot>> {
    const doc = await this.usageModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<Nullable<QuotaUsageRoot>> {
    const doc = await this.usageModel.findOne({ enterprise_id: enterpriseId }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findExpiredUsages(now: Date): Promise<QuotaUsageRoot[]> {
    const docs = await this.usageModel.find({
      'usages.cycle_ends_at': { $lte: now },
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async save(quotaUsage: QuotaUsageRoot): Promise<void> {
    const data = this.mapToPersistence(quotaUsage);

    if (!quotaUsage.id) {
      const created = new this.usageModel(data);
      const saved = await created.save({ session: this.session });
      quotaUsage.setId(saved._id.toString());
    } else {
      await this.usageModel.findByIdAndUpdate(quotaUsage.id, data, { upsert: true }).session(this.session).exec();
    }

    await this.invalidateCache(quotaUsage.id!, quotaUsage.enterpriseId);
  }

  private async invalidateCache(id: string, enterpriseId: string): Promise<void> {
    const domain = 'quota-usage';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
    ];
    if (enterpriseId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `enterpriseId:${enterpriseId}`)));
    }
    await Promise.all(invalidations);
  }

  async saveMany(quotaUsages: QuotaUsageRoot[]): Promise<void> {
    await Promise.all(quotaUsages.map(q => this.save(q)));
  }

  async delete(id: string): Promise<void> {
    await this.usageModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: QuotaUsageDocument): QuotaUsageRoot {
    return QuotaUsageRoot.instantiate(
      doc._id.toString(),
      {
        enterpriseId: doc.enterprise_id,
        cycleAnchorDate: doc.cycle_anchor_date,
        usages: (doc.usages || []).map(
          (u) =>
            new RenewableUsageVO({
              key: u.key,
              allocated: u.allocated,
              used: u.used,
              cycleStartAt: u.cycle_start_at,
              cycleEndsAt: u.cycle_ends_at,
            })
        ),
        updatedAt: doc.updated_at || new Date(),
      }
    );
  }

  private mapToPersistence(data: QuotaUsageRoot): Omit<QuotaUsageModel, 'updated_at'> {
    return {
      enterprise_id: data.enterpriseId,
      cycle_anchor_date: data.cycleAnchorDate,
      usages: data.usages.map((u) => ({
        key: u.key,
        allocated: u.allocated,
        used: u.used,
        cycle_start_at: u.cycleStartAt,
        cycle_ends_at: u.cycleEndsAt,
      })),
    };
  }
}
