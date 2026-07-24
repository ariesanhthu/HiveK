import { OtpProps } from '../aggregate-roots/otp.aggregate';
import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export class VerificationOtpCreatedEvent extends DomainEvent<OtpProps> {
  public readonly eventType = 'VerificationOtpCreated';
  public readonly aggregateType = EAggregateType.OTP;

  constructor(
    aggregateId: string,
    payload: OtpProps,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
