import { Nullable } from '@/core/types';
import { OutboxEntity } from '../../entities/outbox.entity';
import { EOutboxStatus } from '../../enums';

export interface IOutboxRepository {
  findById(id: string): Promise<Nullable<OutboxEntity>>;
  save(entity: OutboxEntity): Promise<void>;
  saveMany(entities: OutboxEntity[]): Promise<void>;
  findPending(limit: number): Promise<OutboxEntity[]>;
  delete(id: string): Promise<void>;
}

export const OUTBOX_REPOSITORY = Symbol('IOutboxRepository');
