import { EventMetadata, IntegrationEvent, TransportMetadata } from '@/core/common/base.integration-event';
import { EOtpType } from '@/core/enums';

export interface SendVerificationEmailRequestedPayload {
  email: string;
  otpCode: string;
  type: EOtpType;
  expireAt: Date;
}

export class SendVerificationEmailRequestedEvent extends IntegrationEvent<SendVerificationEmailRequestedPayload> {
  public readonly eventType = 'SendVerificationEmailRequested';

  constructor(
    payload: SendVerificationEmailRequestedPayload,
    metadata?: EventMetadata,
    transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
