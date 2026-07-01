import { type IRepository } from './repository.interface';
import { type OutboxEntity } from '@/core/entities/outbox.entity';

export interface IOutboxRepository extends IRepository<OutboxEntity> {
	findPending(limit: number): Promise<OutboxEntity[]>;
}

export const OUTBOX_REPOSITORY = Symbol('IOutboxRepository');
