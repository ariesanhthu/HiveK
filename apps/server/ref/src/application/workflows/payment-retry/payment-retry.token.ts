/**
 * Payment Retry Workflow - Activity and Workflow Tokens
 *
 * Centralized symbol tokens for type-safe, refactor-safe references.
 */

/**
 * Workflow Token
 */
export const PAYMENT_RETRY_WORKFLOW = Symbol('payment-retry');

/**
 * Activity Tokens
 */
export const VALIDATE_RETRY_ACTIVITY = Symbol('ValidateRetry');
export const CREATE_ATTEMPT_ACTIVITY = Symbol('CreateAttempt');

// Reused from payment-create
export {
	REQUEST_PAYMENT_URL_ACTIVITY,
	CANCEL_ATTEMPT_ACTIVITY,
} from '../payment-create/payment-create.token';
