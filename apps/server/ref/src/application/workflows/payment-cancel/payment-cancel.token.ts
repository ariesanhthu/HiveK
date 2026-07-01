/**
 * Payment Cancel Workflow Tokens
 *
 * Symbol-based tokens for refactor-safe references.
 */

// Workflow token
export const PAYMENT_CANCEL_WORKFLOW = Symbol('payment-cancel-workflow');

// Activity tokens
export const VALIDATE_CANCEL_ACTIVITY = Symbol('validate-cancel-activity');
export const CANCEL_AT_PROVIDER_ACTIVITY = Symbol('cancel-at-provider-activity');
export const CANCEL_PAYMENT_ACTIVITY = Symbol('cancel-payment-activity');
