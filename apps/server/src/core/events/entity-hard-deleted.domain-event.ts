import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';
import { TargetType } from '../enums/target-type.enum';

export interface EntityHardDeletedPayload {
  entityId: string;
  targetType: TargetType;
}

export class EntityHardDeletedEvent extends DomainEvent<EntityHardDeletedPayload> {
  public readonly eventType = 'EntityHardDeleted';
  public readonly aggregateType = EAggregateType.ENTERPRISE;

  constructor(
    aggregateId: string,
    payload: EntityHardDeletedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
