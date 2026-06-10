import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { IOutboxRepository } from '@/core/interfaces/repositories';
import { OutboxEntity } from '@/core/entities/outbox.entity';
import { OutboxModel, OutboxDocument } from '../schemas/outbox.schema';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { EOutboxStatus } from '@/core/enums';

@Injectable()
export class MongoOutboxRepository implements IOutboxRepository {
  constructor(
    @InjectModel(OutboxModel.name)
    private readonly outboxModel: Model<OutboxDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<OutboxEntity>> {
    const doc = await this.outboxModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(entity: OutboxEntity): Promise<void> {
    const data = this.mapToPersistence(entity);

    if (!entity.id) {
      const created = new this.outboxModel(data);
      const saved = await created.save({ session: this.session });
      entity.setId(saved._id.toString());
    } else {
      await this.outboxModel.findByIdAndUpdate(entity.id, data).session(this.session).exec();
    }
  }

  async saveMany(entities: OutboxEntity[]): Promise<void> {
    await Promise.all(entities.map(e => this.save(e)));
  }

  async findPending(limit: number): Promise<OutboxEntity[]> {
    const docs = await this.outboxModel
      .find({ status: EOutboxStatus.PENDING })
      .sort({ created_at: 1 })
      .limit(limit)
      .session(this.session)
      .exec();
    
    return docs.map(doc => this.mapToDomain(doc));
  }

  async delete(id: string): Promise<void> {
    await this.outboxModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: OutboxDocument): OutboxEntity {
    if (!doc._id) {
        throw new Error('Outbox document ID is missing');
    }
    return OutboxEntity.instantiate(doc._id.toString(), {
      topic: doc.topic,
      payload: doc.payload,
      status: doc.status,
      retryCount: doc.retry_count,
      maxRetry: doc.max_retry,
      errorReason: doc.error_reason || null,
      createdAt: doc.created_at,
      processedAt: doc.processed_at || null,
    });
  }

  private mapToPersistence(entity: OutboxEntity): Partial<OutboxModel> {
    return {
      topic: entity.topic,
      payload: entity.payload,
      status: entity.status,
      retry_count: entity.retryCount,
      max_retry: entity.maxRetry,
      error_reason: entity.errorReason || undefined,
      created_at: entity.createdAt,
      processed_at: entity.processedAt || undefined,
    };
  }
}
