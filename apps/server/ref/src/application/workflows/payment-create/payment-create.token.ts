/**
 * Payment Create Workflow - Activity and Workflow Tokens
 *
 * Centralized symbol tokens for type-safe, refactor-safe references.
 * These tokens are used throughout the application and infrastructure layers.
 */

/**
 * Workflow Token
 */
export const PAYMENT_CREATE_WORKFLOW = Symbol('payment-create');

/**
 * Activity Tokens
 */
export const VALIDATE_CREATE_ACTIVITY = Symbol('ValidateCreate');
export const CREATE_PAYMENT_ENTRY_ACTIVITY = Symbol('CreatePaymentEntry');
export const REQUEST_PAYMENT_URL_ACTIVITY = Symbol('RequestPaymentUrl');
export const CANCEL_ATTEMPT_ACTIVITY = Symbol('CancelAttempt');
