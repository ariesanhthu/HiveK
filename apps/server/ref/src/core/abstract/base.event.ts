import { EAggregateType } from '../enums';
import { type IDomainEvent } from '../interfaces';

export abstract class DomainEvent<T = any> implements IDomainEvent {
  abstract eventType: string;
  abstract aggregateType: EAggregateType;
  occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly payload: T,
    public readonly metadata?: Record<string, unknown>,
  ) {}

  getOccurredAt(): Date {
    return this.occurredAt;
  }

  getAggregateId(): string {
    return this.aggregateId;
  }
}
