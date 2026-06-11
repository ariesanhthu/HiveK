import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface UserRevokedFromEnterprisePayload {
  userId: string;
  userEmail: string;
  enterpriseId: string;
  enterpriseName?: string;
}

export class UserRevokedFromEnterpriseEvent extends DomainEvent<UserRevokedFromEnterprisePayload> {
  public readonly eventType = 'UserRevokedFromEnterprise';
  public readonly aggregateType = EAggregateType.USER;

  constructor(
    aggregateId: string,
    payload: UserRevokedFromEnterprisePayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
