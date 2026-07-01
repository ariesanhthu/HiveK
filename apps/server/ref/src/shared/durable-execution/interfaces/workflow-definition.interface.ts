/**
 * Workflow Definition Interface
 *
 * Provider-agnostic workflow definition in shared layer.
 * Re-exported from application layer for backward compatibility.
 *
 * TODO: Once refactoring is complete, move all workflow definitions to use this shared version
 * and remove the application layer version.
 */

import { type ActivityOptions } from './activity-options.interface';

/**
 * Branch definition for conditional workflow execution
 * Supports first-match-wins strategy
 */
export interface Branch<TContext = Record<string, unknown>> {
	/**
	 * Human-readable name for this branch
	 */
	name?: string;

	/**
	 * Condition predicate for this branch
	 * If not provided, branch always matches (useful for fallback)
	 * @param ctx - Current workflow context
	 * @returns true if this branch should execute
	 */
	when?: (ctx: TContext) => boolean;

	/**
	 * Activity to execute if condition matches
	 */
	activity: string | symbol;

	/**
	 * Transform context to activity input for this branch
	 */
	input?: (ctx: TContext) => unknown;

	/**
	 * Compensation activity for this branch (optional)
	 * Executed during saga rollback if this branch was taken
	 */
	compensation?: {
		activity: string | symbol;
		input?: (ctx: TContext) => unknown;
	};

	/**
	 * Activity options specific to this branch
	 */
	activityOptions?: ActivityOptions;
}

/**
 * Single step in a workflow
 * Supports conditional execution, branching, and compensation (saga pattern)
 */
export interface WorkflowStep<TContext = Record<string, unknown>> {
	/**
	 * Unique name for this step within the workflow
	 */
	name: string;

	/**
	 * Activity function name to execute
	 * Optional if branches are provided
	 * Supports both string names and symbol tokens
	 */
	activity?: string | symbol;

	/**
	 * Transform workflow context to activity input
	 * @param ctx - Current workflow context (input + previous step outputs)
	 */
	input?: (ctx: TContext) => unknown;

	/**
	 * Key to store the activity result in context
	 * If not provided, result is not stored
	 */
	outputKey?: string;

	/**
	 * Activity-level execution options
	 */
	activityOptions?: ActivityOptions;

	/**
	 * Conditional execution predicate
	 * If provided and returns false, this step is skipped
	 * @param ctx - Current workflow context
	 */
	when?: (ctx: TContext) => boolean;

	/**
	 * Conditional branches (first-match-wins)
	 * If provided, evaluates each branch's `when` condition in order
	 * Executes the first matching branch instead of the main activity
	 *
	 * @example
	 * ```typescript
	 * {
	 *   name: 'process-payment',
	 *   branches: [
	 *     { when: ctx => ctx.amount > 1000, activity: 'highValuePayment' },
	 *     { when: ctx => ctx.amount > 100, activity: 'mediumValuePayment' },
	 *     { when: ctx => true, activity: 'standardPayment' } // default
	 *   ]
	 * }
	 * ```
	 */
	branches?: Branch<TContext>[];

	/**
	 * Compensation activity for saga pattern
	 * Executed in LIFO order during workflow rollback
	 *
	 * @example
	 * ```typescript
	 * {
	 *   name: 'charge-card',
	 *   activity: 'chargeCard',
	 *   compensation: {
	 *     activity: 'refundCard',
	 *     input: ctx => ({ transactionId: ctx.chargeResult.transactionId })
	 *   }
	 * }
	 * ```
	 */
	compensation?: {
		/**
		 * Activity to execute for compensation
		 */
		activity: string | symbol;

		/**
		 * Transform context to compensation input
		 * Receives snapshot of context at time of original step execution
		 */
		input?: (ctx: TContext) => unknown;

		/**
		 * Compensation-specific activity options
		 * If not provided, uses same options as original activity
		 */
		activityOptions?: ActivityOptions;
	};
}

/**
 * Context snapshot for compensation tracking
 * Stores the state at the time a step completed successfully
 */
export interface CompletedStepSnapshot<TContext = Record<string, unknown>> {
	/**
	 * Name of the completed step
	 */
	stepName: string;

	/**
	 * Snapshot of context at completion time
	 * Used as input for compensation activities
	 */
	contextSnapshot: TContext;

	/**
	 * Compensation configuration from the step definition
	 */
	compensation?: {
		activity: string | symbol;
		input?: (ctx: TContext) => unknown;
		activityOptions?: ActivityOptions;
	};
}

/**
 * Complete workflow definition
 */
export interface WorkflowDefinition<
	TInput = unknown,
	TOutput = unknown,
	TContext = Record<string, unknown>,
> {
	/**
	 * Unique symbol token for this workflow
	 */
	token: symbol;

	/**
	 * Human-readable workflow name
	 */
	name: string;

	/**
	 * Ordered list of steps to execute
	 */
	steps: WorkflowStep<TContext & { input: TInput }>[];

	/**
	 * Extract final output from context after all steps complete
	 * @param ctx - Final workflow context
	 */
	output?: (ctx: TContext & { input: TInput }) => TOutput;

	/**
	 * Default activity options for all steps
	 * Can be overridden per-step via step.activityOptions
	 */
	defaultActivityOptions?: ActivityOptions;

	/**
	 * Workflow-level timeout in milliseconds
	 */
	timeout?: number;

	/**
	 * Error handler for workflow-level errors
	 * Called when a step fails or throws an error
	 * Can decide whether to trigger compensation, retry, or fail
	 *
	 * @param error - The error that occurred
	 * @param context - Current workflow context
	 * @param completedSteps - Steps completed before error (for compensation)
	 * @returns Action to take: 'compensate' | 'retry' | 'fail' | 'continue'
	 *
	 * @example
	 * ```typescript
	 * onError: async (error, context, completedSteps) => {
	 *   if (error.type === 'RETRIABLE') return 'retry';
	 *   if (completedSteps.length > 0) return 'compensate';
	 *   return 'fail';
	 * }
	 * ```
	 */
	onError?: (
		error: Error,
		context: TContext & { input: TInput },
		completedSteps: CompletedStepSnapshot<TContext & { input: TInput }>[]
	) =>
		| Promise<'compensate' | 'retry' | 'fail' | 'continue'>
		| 'compensate'
		| 'retry'
		| 'fail'
		| 'continue';
}

/**
 * Registry of all workflow definitions
 * Used by infrastructure to map tokens to implementations
 */
export interface IWorkflowRegistry {
	register<TInput, TOutput>(definition: WorkflowDefinition<TInput, TOutput>): void;
	get(token: symbol): WorkflowDefinition | undefined;
	getAll(): WorkflowDefinition[];
}

/**
 * ===============================================
 * USAGE NOTES
 * ===============================================
 *
 * For comprehensive examples and usage guide, see:
 * src/shared/durable-execution/README.md
 *
 * Quick Reference:
 *
 * - **Conditional Steps**: Use `when` predicate to skip steps
 * - **Branching**: Use `branches` array with first-match-wins strategy
 * - **Compensation**: Use `compensation` field for SAGA rollback (LIFO order)
 * - **Error Handling**: Use `onError` to decide: compensate/retry/fail/continue
 * - **Activity Options**: Override per-step timeouts and retry policies
 * - **Heartbeat**: Use `ActivityExecutionContext` for long-running activities
 * - **Activity Tokens**: Use `@Activity` decorator with `getActivityToken()`
 */
