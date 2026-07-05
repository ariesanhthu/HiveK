import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface UserAddedToEnterprisePayload {
  userId: string;
  userEmail: string;
  enterpriseId: string;
  enterpriseName?: string;
}

export class UserAddedToEnterpriseEvent extends DomainEvent<UserAddedToEnterprisePayload> {
  public readonly eventType = 'UserAddedToEnterprise';
  public readonly aggregateType = EAggregateType.USER;

  constructor(
    aggregateId: string,
    payload: UserAddedToEnterprisePayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
