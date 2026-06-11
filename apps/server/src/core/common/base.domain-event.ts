import { EAggregateType } from '../enums/aggregate-type.enum';

export abstract class DomainEvent<T = any> {
  abstract eventType: string;
  abstract aggregateType: EAggregateType;
  occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly payload: T,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
