/**
 * Error Type Enum
 *
 * Classifies errors for workflow decision-making
 * Used by error handlers to determine retry/compensate/fail actions
 */

/**
 * Error classification for workflow error handling
 */
export enum ErrorType {
	/**
	 * Error is retriable - automatic retry with backoff
	 * Examples: Network timeout, temporary database lock, rate limit
	 */
	RETRIABLE = 'RETRIABLE',

	/**
	 * Error is not retriable - fail immediately
	 * Examples: Invalid input, business rule violation, unauthorized
	 */
	NON_RETRIABLE = 'NON_RETRIABLE',

	/**
	 * Activity timed out
	 * Can be retriable depending on context
	 */
	TIMEOUT = 'TIMEOUT',

	/**
	 * Activity or workflow was cancelled
	 * Triggers cleanup and compensation
	 */
	CANCELLED = 'CANCELLED',

	/**
	 * Unknown error type
	 * Treat as non-retriable by default
	 */
	UNKNOWN = 'UNKNOWN',
}

/**
 * Helper to check if an error type is retriable
 *
 * @param errorType - The error type to check
 * @returns true if error should be retried automatically
 */
export function isRetriableErrorType(errorType: ErrorType): boolean {
	return errorType === ErrorType.RETRIABLE;
}
