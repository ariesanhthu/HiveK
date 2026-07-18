import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnterpriseQuotaAllocationDocument, EnterpriseQuotaAllocationModel } from '../schemas';
import { IEnterpriseQuotaAllocationRepository } from '@/core/interfaces/repositories';
import { EnterpriseQuotaAllocationRoot } from '@/core/aggregate-roots';
import { EnterpriseQuotaAllocationVO } from '@/core/value-objects';
import { EGrantType } from '@/core/enums';
import { Nullable } from '@/core/types';

@Injectable()
export class MongoEnterpriseQuotaAllocationRepository implements IEnterpriseQuotaAllocationRepository {
  constructor(
    @InjectModel(EnterpriseQuotaAllocationModel.name)
    private readonly model: Model<EnterpriseQuotaAllocationDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<EnterpriseQuotaAllocationRoot>> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Nullable<EnterpriseQuotaAllocationRoot>> {
    const doc = await this.model.findOne({ owner_id: ownerId }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(entity: EnterpriseQuotaAllocationRoot): Promise<void> {
    const data = this.mapToPersistence(entity);

    if (!entity.id) {
      const created = new this.model(data);
      const saved = await created.save();
      entity.setId(saved._id.toString());
    } else {
      await this.model.findByIdAndUpdate(entity.id, data, { upsert: true }).exec();
    }
  }

  async saveMany(entities: EnterpriseQuotaAllocationRoot[]): Promise<void> {
    await Promise.all(entities.map((e) => this.save(e)));
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  private mapToDomain(doc: EnterpriseQuotaAllocationDocument): EnterpriseQuotaAllocationRoot {
    const allocations: EnterpriseQuotaAllocationVO[] = (doc.allocations || []).map((a) => {
      return new EnterpriseQuotaAllocationVO({
        ownerId: doc.owner_id,
        enterpriseId: a.enterprise_id,
        key: a.key,
        allocated: a.allocated,
        kind: a.kind as EGrantType,
        isPool: a.is_pool,
      });
    });

    return EnterpriseQuotaAllocationRoot.instantiate(doc.id!, {
      ownerId: doc.owner_id,
      allocations,
      updatedAt: doc.updated_at || new Date(),
    });
  }

  private mapToPersistence(entity: EnterpriseQuotaAllocationRoot) {
    const allocations = entity.allocations.map((a) => ({
      enterprise_id: a.enterpriseId,
      key: a.key,
      allocated: a.allocated,
      kind: a.kind,
      is_pool: a.isPool,
    }));

    return {
      owner_id: entity.ownerId,
      allocations,
      updated_at: entity.updatedAt,
    };
  }
}