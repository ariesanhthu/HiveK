/**
 * Workflow Error Class
 *
 * Standardized error for durable execution workflows
 * Wraps domain errors with classification for retry/compensation logic
 */

import { ErrorType } from './error-type.enum';

/**
 * Standardized error for workflow execution
 * Extends native Error with classification and context
 */
export class WorkflowError extends Error {
	/**
	 * Error classification for decision-making
	 */
	public readonly type: ErrorType;

	/**
	 * Original error that was thrown
	 */
	public readonly cause?: Error;

	/**
	 * Additional context about the error
	 */
	public readonly details?: Record<string, unknown>;

	/**
	 * Name of the activity that failed
	 */
	public readonly activityName?: string;

	/**
	 * Name of the workflow step that failed
	 */
	public readonly stepName?: string;

	/**
	 * Whether this error is retriable
	 */
	public readonly retriable: boolean;

	constructor(params: {
		message: string;
		type: ErrorType;
		cause?: Error;
		details?: Record<string, unknown>;
		activityName?: string;
		stepName?: string;
	}) {
		super(params.message);

		// Maintain proper stack trace for where error was thrown (V8 only)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, WorkflowError);
		}

		this.name = 'WorkflowError';
		this.type = params.type;
		this.cause = params.cause;
		this.details = params.details;
		this.activityName = params.activityName;
		this.stepName = params.stepName;
		this.retriable = params.type === ErrorType.RETRIABLE;

		// Include cause stack in error message if available
		if (params.cause?.stack) {
			this.stack = `${this.stack}\n\nCaused by:\n${params.cause.stack}`;
		}
	}

	/**
	 * Create a retriable workflow error
	 */
	static retriable(
		message: string,
		cause?: Error,
		details?: Record<string, unknown>
	): WorkflowError {
		return new WorkflowError({
			message,
			type: ErrorType.RETRIABLE,
			cause,
			details,
		});
	}

	/**
	 * Create a non-retriable workflow error
	 */
	static nonRetriable(
		message: string,
		cause?: Error,
		details?: Record<string, unknown>
	): WorkflowError {
		return new WorkflowError({
			message,
			type: ErrorType.NON_RETRIABLE,
			cause,
			details,
		});
	}

	/**
	 * Create a timeout workflow error
	 */
	static timeout(
		message: string,
		cause?: Error,
		details?: Record<string, unknown>
	): WorkflowError {
		return new WorkflowError({
			message,
			type: ErrorType.TIMEOUT,
			cause,
			details,
		});
	}

	/**
	 * Create a cancellation workflow error
	 */
	static cancelled(
		message: string,
		cause?: Error,
		details?: Record<string, unknown>
	): WorkflowError {
		return new WorkflowError({
			message,
			type: ErrorType.CANCELLED,
			cause,
			details,
		});
	}

	/**
	 * Create an unknown workflow error
	 */
	static unknown(
		message: string,
		cause?: Error,
		details?: Record<string, unknown>
	): WorkflowError {
		return new WorkflowError({
			message,
			type: ErrorType.UNKNOWN,
			cause,
			details,
		});
	}

	/**
	 * Convert to plain object for logging/serialization
	 */
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			type: this.type,
			retriable: this.retriable,
			activityName: this.activityName,
			stepName: this.stepName,
			details: this.details,
			cause: this.cause
				? {
						name: this.cause.name,
						message: this.cause.message,
						stack: this.cause.stack,
					}
				: undefined,
			stack: this.stack,
		};
	}
}
