/**
 * Error Mapper
 *
 * Converts domain errors to WorkflowError with proper classification
 * Provides centralized error mapping registry
 */

import { ErrorType } from './error-type.enum';
import { WorkflowError } from './workflow-error';

/**
 * Error matcher function type
 * Returns ErrorType if error matches, undefined otherwise
 */
export type ErrorMatcher = (error: Error) => ErrorType | undefined;

/**
 * Error mapping registry
 * Maps error patterns to error types for classification
 */
class ErrorMappingRegistry {
	private matchers: ErrorMatcher[] = [];

	/**
	 * Register an error matcher
	 * Matchers are evaluated in registration order
	 *
	 * @param matcher - Function that matches errors to types
	 */
	register(matcher: ErrorMatcher): void {
		this.matchers.push(matcher);
	}

	/**
	 * Find error type for given error
	 * Returns first matching error type, or UNKNOWN if no match
	 *
	 * @param error - Error to classify
	 * @returns Classified error type
	 */
	classify(error: Error): ErrorType {
		for (const matcher of this.matchers) {
			const type = matcher(error);
			if (type !== undefined) {
				return type;
			}
		}
		return ErrorType.UNKNOWN;
	}

	/**
	 * Clear all registered matchers
	 * Useful for testing
	 */
	clear(): void {
		this.matchers = [];
	}
}

/**
 * Global error mapping registry
 */
export const errorRegistry = new ErrorMappingRegistry();

/**
 * Convert any error to WorkflowError with proper classification
 *
 * @param error - Error to convert
 * @param context - Optional context (activityName, stepName)
 * @returns Classified WorkflowError
 *
 * @example
 * ```typescript
 * try {
 *   await activity.execute(input);
 * } catch (error) {
 *   const workflowError = toWorkflowError(error, {
 *     activityName: 'processPayment',
 *     stepName: 'charge-card'
 *   });
 *
 *   if (workflowError.retriable) {
 *     // Retry logic
 *   } else {
 *     // Compensation logic
 *   }
 * }
 * ```
 */
export function toWorkflowError(
	error: unknown,
	context?: {
		activityName?: string;
		stepName?: string;
	}
): WorkflowError {
	// Already a WorkflowError - just add context if missing
	if (error instanceof WorkflowError) {
		if (context?.activityName && !error.activityName) {
			return new WorkflowError({
				message: error.message,
				type: error.type,
				cause: error.cause,
				details: error.details,
				activityName: context.activityName,
				stepName: context.stepName ?? error.stepName,
			});
		}
		return error;
	}

	// Convert to Error if not already
	const err = error instanceof Error ? error : new Error(String(error));

	// Classify using registry
	const type = errorRegistry.classify(err);

	return new WorkflowError({
		message: err.message,
		type,
		cause: err,
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Check if error is retriable
 * Convenience helper for error handling logic
 *
 * @param error - Error to check
 * @returns true if error should be retried
 */
export function isRetriable(error: unknown): boolean {
	if (error instanceof WorkflowError) {
		return error.retriable;
	}

	if (error instanceof Error) {
		const type = errorRegistry.classify(error);
		return type === ErrorType.RETRIABLE;
	}

	return false;
}

/**
 * ===============================================
 * DEFAULT ERROR MATCHERS
 * ===============================================
 */

// Network and timeout errors - retriable
errorRegistry.register((error: Error) => {
	const message = error.message.toLowerCase();
	const name = error.name.toLowerCase();

	if (
		message.includes('timeout') ||
		message.includes('timed out') ||
		message.includes('econnrefused') ||
		message.includes('econnreset') ||
		message.includes('etimedout') ||
		name.includes('timeout')
	) {
		return ErrorType.TIMEOUT;
	}

	return undefined;
});

// Database errors - retriable
errorRegistry.register((error: Error) => {
	const message = error.message.toLowerCase();

	if (
		message.includes('deadlock') ||
		message.includes('lock timeout') ||
		message.includes('connection pool') ||
		message.includes('too many connections')
	) {
		return ErrorType.RETRIABLE;
	}

	return undefined;
});

// Cancellation errors - not retriable
errorRegistry.register((error: Error) => {
	const message = error.message.toLowerCase();
	const name = error.name.toLowerCase();

	if (
		message.includes('cancel') ||
		message.includes('abort') ||
		name.includes('cancel') ||
		name.includes('abort')
	) {
		return ErrorType.CANCELLED;
	}

	return undefined;
});

// Validation errors - not retriable
errorRegistry.register((error: Error) => {
	const name = error.name.toLowerCase();
	const message = error.message.toLowerCase();

	if (
		name.includes('validation') ||
		name.includes('zod') ||
		message.includes('invalid') ||
		message.includes('validation failed')
	) {
		return ErrorType.NON_RETRIABLE;
	}

	return undefined;
});
