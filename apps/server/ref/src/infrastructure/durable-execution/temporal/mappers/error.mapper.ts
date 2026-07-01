/**
 * Temporal Error Mapper
 *
 * Converts Temporal-specific errors to shared layer WorkflowError classes.
 * Enables provider-agnostic error handling in workflows.
 *
 * Maps:
 * - ApplicationFailure → WorkflowError with appropriate type
 * - ActivityFailure → WorkflowError with activity context
 * - TimeoutFailure → WorkflowError (TIMEOUT)
 * - CancelledFailure → WorkflowError (CANCELLED)
 * - TerminatedFailure → WorkflowError (NON_RETRIABLE)
 * - Generic errors → WorkflowError (UNKNOWN)
 */

import {
	ApplicationFailure,
	ActivityFailure,
	TimeoutFailure,
	CancelledFailure,
	TerminatedFailure,
	ChildWorkflowFailure,
	ServerFailure,
} from '@temporalio/common';
import { WorkflowError } from '@/shared/durable-execution/errors/workflow-error';
import { ErrorType } from '@/shared/durable-execution/errors/error-type.enum';

/**
 * Error mapping context
 * Provides additional information for error mapping
 */
export interface ErrorMappingContext {
	/** Name of the activity that failed */
	activityName?: string;
	/** Name of the workflow step that failed */
	stepName?: string;
	/** Current retry attempt number */
	attempt?: number;
	/** Additional context details */
	details?: Record<string, unknown>;
}

/**
 * Map Temporal Failure to WorkflowError
 *
 * Main entry point for error conversion.
 * Handles all Temporal error types and converts to standardized WorkflowError.
 *
 * @param failure - Temporal Failure object or generic Error
 * @param context - Additional error context
 * @returns Mapped WorkflowError
 */
export function mapTemporalError(failure: unknown, context?: ErrorMappingContext): WorkflowError {
	// Handle ApplicationFailure (most common case)
	if (failure instanceof ApplicationFailure) {
		return mapApplicationFailure(failure, context);
	}

	// Handle ActivityFailure (wraps activity errors)
	if (failure instanceof ActivityFailure) {
		return mapActivityFailure(failure, context);
	}

	// Handle TimeoutFailure
	if (failure instanceof TimeoutFailure) {
		return mapTimeoutFailure(failure, context);
	}

	// Handle CancelledFailure
	if (failure instanceof CancelledFailure) {
		return mapCancelledFailure(failure, context);
	}

	// Handle TerminatedFailure
	if (failure instanceof TerminatedFailure) {
		return mapTerminatedFailure(failure, context);
	}

	// Handle ChildWorkflowFailure
	if (failure instanceof ChildWorkflowFailure) {
		return mapChildWorkflowFailure(failure, context);
	}

	// Handle ServerFailure
	if (failure instanceof ServerFailure) {
		return mapServerFailure(failure, context);
	}

	// Handle generic Error
	if (failure instanceof Error) {
		return mapGenericError(failure, context);
	}

	// Fallback for unknown failure types
	return new WorkflowError({
		message: 'Unknown error occurred',
		type: ErrorType.UNKNOWN,
		details: {
			...context?.details,
			failure: String(failure),
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map ApplicationFailure to WorkflowError
 *
 * ApplicationFailure is the primary error type thrown by activities.
 * It contains type information that we use to classify retriability.
 */
function mapApplicationFailure(
	failure: ApplicationFailure,
	context?: ErrorMappingContext
): WorkflowError {
	// Determine error type based on failure.type or nonRetryable flag
	let errorType: ErrorType;

	if (failure.type === 'TIMEOUT') {
		errorType = ErrorType.TIMEOUT;
	} else if (failure.type === 'CANCELLED') {
		errorType = ErrorType.CANCELLED;
	} else if (failure.nonRetryable) {
		errorType = ErrorType.NON_RETRIABLE;
	} else {
		// Default to retriable for application failures
		errorType = ErrorType.RETRIABLE;
	}

	return new WorkflowError({
		message: failure.message || 'Application failure',
		type: errorType,
		cause: failure.cause instanceof Error ? failure.cause : undefined,
		details: {
			...context?.details,
			failureType: failure.type,
			nonRetryable: failure.nonRetryable,
			details: failure.details,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map ActivityFailure to WorkflowError
 *
 * ActivityFailure wraps errors thrown by activities.
 * Extract activity information and recurse on the cause.
 */
function mapActivityFailure(
	failure: ActivityFailure,
	context?: ErrorMappingContext
): WorkflowError {
	// Extract activity name from failure
	const activityName = context?.activityName || failure.activityType;

	// Recursively map the cause if it exists
	if (failure.cause) {
		return mapTemporalError(failure.cause, {
			...context,
			activityName,
		});
	}

	// No cause - create generic activity error
	return new WorkflowError({
		message: failure.message || 'Activity failed',
		type: ErrorType.RETRIABLE,
		details: {
			...context?.details,
			activityId: failure.activityId,
			activityType: failure.activityType,
			retryState: failure.retryState,
		},
		activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map TimeoutFailure to WorkflowError
 *
 * Timeouts can be retriable depending on timeout type.
 */
function mapTimeoutFailure(failure: TimeoutFailure, context?: ErrorMappingContext): WorkflowError {
	return new WorkflowError({
		message: failure.message || 'Operation timed out',
		type: ErrorType.TIMEOUT,
		cause: failure.cause instanceof Error ? failure.cause : undefined,
		details: {
			...context?.details,
			timeoutType: failure.timeoutType,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map CancelledFailure to WorkflowError
 *
 * Cancellation is always non-retriable and triggers compensation.
 */
function mapCancelledFailure(
	failure: CancelledFailure,
	context?: ErrorMappingContext
): WorkflowError {
	return new WorkflowError({
		message: failure.message || 'Operation was cancelled',
		type: ErrorType.CANCELLED,
		cause: failure.cause instanceof Error ? failure.cause : undefined,
		details: {
			...context?.details,
			details: failure.details,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map TerminatedFailure to WorkflowError
 *
 * Termination is non-retriable.
 */
function mapTerminatedFailure(
	failure: TerminatedFailure,
	context?: ErrorMappingContext
): WorkflowError {
	return new WorkflowError({
		message: failure.message || 'Workflow was terminated',
		type: ErrorType.NON_RETRIABLE,
		cause: failure.cause instanceof Error ? failure.cause : undefined,
		details: {
			...context?.details,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map ChildWorkflowFailure to WorkflowError
 *
 * Child workflow failures recurse on the cause.
 */
function mapChildWorkflowFailure(
	failure: ChildWorkflowFailure,
	context?: ErrorMappingContext
): WorkflowError {
	// Recursively map the cause if it exists
	if (failure.cause) {
		return mapTemporalError(failure.cause, {
			...context,
			details: {
				...context?.details,
				workflowType: failure.workflowType,
				retryState: failure.retryState,
			},
		});
	}

	// No cause - create generic child workflow error
	return new WorkflowError({
		message: failure.message || 'Child workflow failed',
		type: ErrorType.RETRIABLE,
		details: {
			...context?.details,
			workflowType: failure.workflowType,
			retryState: failure.retryState,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map ServerFailure to WorkflowError
 *
 * Server failures are typically retriable.
 */
function mapServerFailure(failure: ServerFailure, context?: ErrorMappingContext): WorkflowError {
	return new WorkflowError({
		message: failure.message || 'Server error',
		type: ErrorType.RETRIABLE,
		cause: failure.cause instanceof Error ? failure.cause : undefined,
		details: {
			...context?.details,
			serverFailure: true,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Map generic Error to WorkflowError
 *
 * Fallback for errors that don't match Temporal types.
 */
function mapGenericError(error: Error, context?: ErrorMappingContext): WorkflowError {
	// Try to infer error type from error message/name
	const message = error.message.toLowerCase();
	const name = error.name.toLowerCase();

	let errorType: ErrorType = ErrorType.UNKNOWN;

	if (message.includes('timeout') || name.includes('timeout') || message.includes('timed out')) {
		errorType = ErrorType.TIMEOUT;
	} else if (message.includes('cancel') || name.includes('cancel') || message.includes('abort')) {
		errorType = ErrorType.CANCELLED;
	} else if (
		message.includes('network') ||
		message.includes('connection') ||
		message.includes('econnrefused') ||
		message.includes('enotfound')
	) {
		errorType = ErrorType.RETRIABLE;
	} else if (
		message.includes('validation') ||
		message.includes('invalid') ||
		message.includes('unauthorized') ||
		message.includes('forbidden')
	) {
		errorType = ErrorType.NON_RETRIABLE;
	}

	return new WorkflowError({
		message: error.message || 'Unknown error',
		type: errorType,
		cause: error,
		details: {
			...context?.details,
			errorName: error.name,
			errorStack: error.stack,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}

/**
 * Create ApplicationFailure from WorkflowError
 *
 * Reverse mapping for throwing errors from activities.
 * Converts shared layer WorkflowError back to Temporal ApplicationFailure.
 *
 * @param error - WorkflowError to convert
 * @returns Temporal ApplicationFailure
 */
export function toTemporalError(error: WorkflowError): ApplicationFailure {
	return ApplicationFailure.create({
		message: error.message,
		type: error.type,
		nonRetryable: !error.retriable,
		cause: error.cause,
		details: [error.details],
	});
}

/**
 * Check if error is a Temporal Failure
 *
 * @param error - Error to check
 * @returns true if error is a Temporal Failure type
 */
export function isTemporalFailure(error: unknown): boolean {
	return (
		error instanceof ApplicationFailure ||
		error instanceof ActivityFailure ||
		error instanceof TimeoutFailure ||
		error instanceof CancelledFailure ||
		error instanceof TerminatedFailure ||
		error instanceof ChildWorkflowFailure ||
		error instanceof ServerFailure
	);
}

/**
 * Safe error mapping that handles unknown types
 *
 * Use this as the primary error mapping function in catch blocks.
 *
 * @param error - Any error object
 * @param context - Error mapping context
 * @returns WorkflowError
 */
export function safeMapError(error: unknown, context?: ErrorMappingContext): WorkflowError {
	if (isTemporalFailure(error)) {
		return mapTemporalError(error, context);
	}

	if (error instanceof Error) {
		return mapTemporalError(error, context);
	}

	// Handle non-Error objects
	return new WorkflowError({
		message: String(error),
		type: ErrorType.UNKNOWN,
		details: {
			...context?.details,
			rawError: error,
		},
		activityName: context?.activityName,
		stepName: context?.stepName,
	});
}
