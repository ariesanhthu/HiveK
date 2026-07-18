import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';
import { ETargetType } from '../enums/target-type.enum';

export interface EntityHardDeletedPayload {
  entityId: string;
  targetType: ETargetType;
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
