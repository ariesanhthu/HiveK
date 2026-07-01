/**
 * Payment Handle Webhook - Symbol Tokens
 */

// Workflow token
export const PAYMENT_HANDLE_WEBHOOK_WORKFLOW = Symbol('payment-handle-webhook');

// Activity tokens
export const VALIDATE_WEBHOOK_ACTIVITY = Symbol('validate-webhook');
export const MARK_WEBHOOK_RECEIVED_ACTIVITY = Symbol('mark-webhook-received');
export const PARSE_WEBHOOK_ACTIVITY = Symbol('parse-webhook');
export const PROCESS_WEBHOOK_RESULT_ACTIVITY = Symbol('process-webhook-result');
