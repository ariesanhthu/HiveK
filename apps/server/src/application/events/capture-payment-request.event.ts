import { IntegrationEvent, EventMetadata, TransportMetadata } from '@/core/common';

export interface CapturePaymentRequestPayload {
  paymentId: string;
  paymentAttemptId: string;
  capturedBy: string;
  amount: number;
  idempotencyKey: string;
}

export class CapturePaymentRequestEvent extends IntegrationEvent<CapturePaymentRequestPayload> {
  public readonly eventType = 'CapturePaymentRequest';

  constructor(
    payload: CapturePaymentRequestPayload,
    metadata?: EventMetadata,
    transport?: TransportMetadata
  ) {
    super(payload, metadata, transport);
  }
}
