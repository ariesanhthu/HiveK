/**
 * Payment Capture Workflow Tokens
 *
 * Symbol-based tokens for refactor-safe references.
 */

// Workflow token
export const PAYMENT_CAPTURE_WORKFLOW = Symbol('payment-capture-workflow');

// Activity tokens
export const VALIDATE_CAPTURE_ACTIVITY = Symbol('validate-capture-activity');
export const EXECUTE_CAPTURE_ACTIVITY = Symbol('execute-capture-activity');
export const PROCESS_CAPTURE_ACTIVITY = Symbol('process-capture-activity');
export const REFUND_FAILED_CAPTURE_ACTIVITY = Symbol('refund-failed-capture-activity');
