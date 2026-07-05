import { BaseAggregateRoot } from '@/core/common';

export interface IEventService {
  publishEvents(
    aggregate: BaseAggregateRoot<unknown> | BaseAggregateRoot<unknown>[],
  ): Promise<void>;
}

export const EVENT_SERVICE = Symbol('IEventService');
