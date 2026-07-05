import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';
import { ERoleType } from '../enums/role-type.enum';

export interface UserSignedUpPayload {
  email: string;
  fullName?: string;
  phone?: string;
  type: ERoleType;
}

export class UserSignedUpEvent extends DomainEvent<UserSignedUpPayload> {
  public readonly eventType = 'UserSignedUp';
  public readonly aggregateType = EAggregateType.USER;

  constructor(
    aggregateId: string,
    payload: UserSignedUpPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
