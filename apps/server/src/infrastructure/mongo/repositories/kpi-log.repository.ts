import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IKpiLogRepository } from '@/core/interfaces/repositories/kpi-log.repository';
import { KpiLogEntity } from '@/core/entities/kpi-log.entity';
import { KpiLogModel, KpiLogDocument } from '../schemas/kpi-log.schema';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoKpiLogRepository implements IKpiLogRepository {
  constructor(
    @InjectModel(KpiLogModel.name)
    private readonly kpiLogModel: Model<KpiLogDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as unknown as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<KpiLogEntity>> {
    const doc = await this.kpiLogModel
      .findById(id)
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(entity: KpiLogEntity): Promise<void> {
    const data = this.mapToPersistence(entity);

    if (!entity.id) {
      const created = new this.kpiLogModel(data);
      const saved = await created.save({ session: this.session });
      entity.setId(saved._id.toString());
    } else {
      await this.kpiLogModel
        .findByIdAndUpdate(entity.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }
  }

  async saveMany(entities: KpiLogEntity[]): Promise<void> {
    await Promise.all(entities.map((e) => this.save(e)));
  }

  async delete(id: string): Promise<void> {
    await this.kpiLogModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: KpiLogDocument): KpiLogEntity {
    if (!doc._id) {
      throw new Error('KpiLog document ID is missing');
    }
    return KpiLogEntity.instantiate(doc._id.toString(), {
      timestamp: doc.timestamp,
      participantId: doc.participantId.toString(),
      outputId: doc.outputId ? doc.outputId.toString() : null,
      metrics: {
        views: doc.metrics?.views || 0,
        likes: doc.metrics?.likes || 0,
        comments: doc.metrics?.comments || 0,
        shares: doc.metrics?.shares || 0,
      },
      deleteAt: doc.delete_at || null,
      deleteBy: doc.delete_by || null,
    });
  }

  private mapToPersistence(entity: KpiLogEntity): Partial<KpiLogModel> {
    return {
      timestamp: entity.timestamp,
      participantId: new Types.ObjectId(entity.participantId),
      outputId: entity.outputId ? new Types.ObjectId(entity.outputId) : null,
      metrics: {
        views: entity.metrics.views,
        likes: entity.metrics.likes,
        comments: entity.metrics.comments,
        shares: entity.metrics.shares,
      },
      delete_at: entity.deleteAt,
      delete_by: entity.deleteBy,
    };
  }
}
