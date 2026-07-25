export enum EPaymentStatus {
  PENDING_PAYMENT_PROVIDER = 'pending_payment_provider',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
}
