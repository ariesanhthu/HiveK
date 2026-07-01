import { type AggregateRoot } from '@/core';
import { type IUnitOfWorkSession } from '../repositories/unit-of-work.interface';

export const EVENT_SERVICE = Symbol('EVENT_SERVICE');

export interface IEventService {
	publishEvents(
		aggregateRoot: AggregateRoot<unknown>,
		session?: IUnitOfWorkSession
	): Promise<void>;
}
