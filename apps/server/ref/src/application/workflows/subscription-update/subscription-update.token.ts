/**
 * Subscription Update Workflow - Symbol Tokens
 */

export const SUBSCRIPTION_UPDATE_WORKFLOW = Symbol('subscription-update');

// Activity tokens
export const VALIDATE_UPDATE_ACTIVITY = Symbol('validate-update');
export const REFUND_CREDIT_ACTIVITY = Symbol('refund-credit');
export const DEDUCT_CREDIT_ACTIVITY = Symbol('deduct-credit');
export const UPDATE_SUBSCRIPTION_ACTIVITY = Symbol('update-subscription');

// Compensation tokens
export const REVERSE_DEDUCT_ACTIVITY = Symbol('reverse-deduct');
export const REVERSE_REFUND_ACTIVITY = Symbol('reverse-refund');
export const REFUND_PAYMENT_ACTIVITY = Symbol('refund-payment');
