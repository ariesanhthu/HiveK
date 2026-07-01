/**
 * Payment Refund Workflow Tokens
 *
 * Symbol-based tokens for refactor-safe references.
 */

// Workflow token
export const PAYMENT_REFUND_WORKFLOW = Symbol('payment-refund-workflow');

// Activity tokens
export const VALIDATE_REFUND_ACTIVITY = Symbol('validate-refund-activity');
export const EXECUTE_REFUND_ACTIVITY = Symbol('execute-refund-activity');
export const PROCESS_REFUND_ACTIVITY = Symbol('process-refund-activity');
