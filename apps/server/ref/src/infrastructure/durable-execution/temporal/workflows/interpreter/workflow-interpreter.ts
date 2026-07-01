/**
 * Workflow Step Interpreter
 *
 * Interprets WorkflowDefinition steps and executes them dynamically.
 * This enables Temporal workflows to use declarative step definitions
 * from the application layer.
 *
 * Features:
 * - Sequential step execution with context passing
 * - Conditional step execution (when predicates)
 * - Branching logic (first-match-wins)
 * - SAGA compensation pattern (LIFO rollback)
 * - Per-step activity options with precedence
 * - Symbol token support for activity identifiers
 * - Error handling with automatic compensation
 */

import { proxyActivities, ApplicationFailure } from '@temporalio/workflow';
import type {
	WorkflowDefinition,
	WorkflowStep,
	Branch,
	CompletedStepSnapshot,
	ActivityOptions,
} from '@/shared/durable-execution/interfaces';
import { TEMPORAL_CONFIG } from '../../config';
import { workflowLogger } from './workflow-logger';
import { resolveActivityIdentifier } from './activity-identifier-resolver';
import { executeCompensations, createStepSnapshot } from './compensation-executor';
import { toTemporalActivityOptions, mergeActivityOptions, safeMapError } from '../../mappers';

/**
 * Evaluate all branches and return the first matching one
 *
 * Branches are evaluated in order. The first branch with a matching condition wins.
 * If no condition matches, returns undefined.
 *
 * @param branches - Array of branches to evaluate
 * @param context - Current workflow context
 * @returns The first matching branch or undefined
 */
function evaluateBranches<TContext extends object>(
	branches: Branch<TContext>[],
	context: TContext
): Branch<TContext> | undefined {
	for (const branch of branches) {
		// If no condition, branch always matches
		if (!branch.when) {
			return branch;
		}

		// Evaluate condition predicate
		try {
			const matches = branch.when(context);
			if (matches) {
				workflowLogger.debug('Branch matched', {
					branchName: branch.name,
					activity: resolveActivityIdentifier(branch.activity),
				});
				return branch;
			}
		} catch (error) {
			workflowLogger.warn('Branch condition evaluation failed', {
				branchName: branch.name,
				error: error instanceof Error ? error.message : String(error),
			});
			// Continue to next branch on condition error
		}
	}

	return undefined;
}

/**
 * Execute a single workflow step
 *
 * Handles:
 * - Conditional execution (when predicates)
 * - Branching logic (first-match-wins)
 * - Per-step activity options with precedence
 * - Activity identifier resolution (symbol → string)
 * - Input building from context
 *
 * @param step - The workflow step to execute
 * @param context - Current workflow context
 * @param workflowOptions - Workflow-level activity options
 * @returns The step result or undefined if skipped
 */
async function executeStep<TContext extends object>(
	step: WorkflowStep<TContext>,
	context: TContext,
	workflowOptions: ActivityOptions = {}
): Promise<unknown> {
	// Check conditional execution
	workflowLogger.info('Start execute step', { stepName: step.name });
	if (step.when && !step.when(context)) {
		workflowLogger.debug('Step skipped (condition not met)', { stepName: step.name });
		return undefined;
	}
	workflowLogger.info('Step condition met', { stepName: step.name });

	// Handle branching
	if (step.branches) {
		const selectedBranch = evaluateBranches(step.branches, context);
		if (!selectedBranch) {
			workflowLogger.warn('No branch matched in step', { stepName: step.name });
			return undefined;
		}

		// Resolve branch activity identifier
		const activityName = resolveActivityIdentifier(selectedBranch.activity);

		// Merge options: branch → step → workflow → system defaults
		const systemDefaults = {
			startToCloseTimeout: TEMPORAL_CONFIG.activities.startToCloseTimeout,
			retry: {
				maximumAttempts: 3,
				initialInterval: '1s',
				maximumInterval: '10s',
				backoffCoefficient: 2,
			},
		};

		// First, merge step → workflow → system (3 levels)
		const baseOptions = mergeActivityOptions(
			step.activityOptions,
			workflowOptions,
			systemDefaults
		);

		// Then, merge branch options on top (branch has highest priority)
		const branchTemporal = selectedBranch.activityOptions
			? toTemporalActivityOptions(selectedBranch.activityOptions)
			: {};

		const temporalOptions = {
			...baseOptions,
			...branchTemporal,
		};

		// Create activity proxy with merged options
		const activities = proxyActivities(temporalOptions);
		const baseActivityFn = activities[activityName];

		if (!baseActivityFn) {
			throw new Error(`Activity not found: ${activityName}`);
		}

		// Wrap with heartbeat if configured in branch or step options
		const branchOptions = selectedBranch.activityOptions;
		const stepOptions = step.activityOptions;
		const hasHeartbeat = branchOptions?.heartbeatTimeout || stepOptions?.heartbeatTimeout;

		// Log heartbeat configuration (actual heartbeat handled by Temporal internally)
		if (hasHeartbeat) {
			const heartbeatConfig = {
				heartbeatTimeout: branchOptions?.heartbeatTimeout || stepOptions?.heartbeatTimeout,
				autoHeartbeat: branchOptions?.autoHeartbeat ?? stepOptions?.autoHeartbeat ?? true,
			};
			workflowLogger.debug('Activity executing with heartbeat', {
				stepName: step.name,
				activityName,
				heartbeatTimeout: heartbeatConfig.heartbeatTimeout,
			});
		}

		// Build input from context
		const input = selectedBranch.input
			? selectedBranch.input(context)
			: (context as TContext & { input?: unknown }).input;

		workflowLogger.info('Executing branch activity', {
			stepName: step.name,
			branchName: selectedBranch.name,
			activityName,
		});

		// Execute activity
		return await baseActivityFn(input);
	}

	// Handle regular step execution
	if (!step.activity) {
		throw new Error(`Step has no activity or branches: ${step.name}`);
	}

	// Resolve activity identifier
	const activityName = resolveActivityIdentifier(step.activity);

	// Merge options: step → workflow → system defaults
	const systemDefaults = {
		startToCloseTimeout: TEMPORAL_CONFIG.activities.startToCloseTimeout,
		retry: {
			maximumAttempts: 3,
			initialInterval: '1s',
			maximumInterval: '10s',
			backoffCoefficient: 2,
		},
	};

	const temporalOptions = mergeActivityOptions(
		step.activityOptions,
		workflowOptions,
		systemDefaults
	);

	// Create activity proxy with merged options
	const activities = proxyActivities(temporalOptions);
	const baseActivityFn = activities[activityName];

	if (!baseActivityFn) {
		throw new Error(`Activity not found: ${activityName}`);
	}

	// Log heartbeat configuration if present (actual heartbeat handled by Temporal)
	const stepOptions = step.activityOptions;
	const hasHeartbeat = stepOptions?.heartbeatTimeout || workflowOptions?.heartbeatTimeout;

	if (hasHeartbeat) {
		const heartbeatConfig = {
			heartbeatTimeout: stepOptions?.heartbeatTimeout || workflowOptions?.heartbeatTimeout,
			autoHeartbeat: stepOptions?.autoHeartbeat ?? workflowOptions?.autoHeartbeat ?? true,
		};
		workflowLogger.debug('Activity executing with heartbeat', {
			stepName: step.name,
			activityName,
			heartbeatTimeout: heartbeatConfig.heartbeatTimeout,
		});
	}

	// Build input from context
	const input = step.input
		? step.input(context)
		: (context as TContext & { input?: unknown }).input;

	workflowLogger.info('Executing step activity', {
		stepName: step.name,
		activityName,
	});

	// Execute activity
	return await baseActivityFn(input);
}

/**
 * Execute a step with compensation tracking
 *
 * Wraps step execution to capture compensation context for SAGA pattern.
 * Only creates snapshots for steps that have compensation defined.
 *
 * @param step - The workflow step to execute
 * @param context - Current workflow context
 * @param workflowOptions - Workflow-level activity options
 * @returns Tuple of [result, snapshot]
 */
async function executeStepWithCompensation<TContext extends object>(
	step: WorkflowStep<TContext>,
	context: TContext,
	workflowOptions: ActivityOptions
): Promise<[unknown, CompletedStepSnapshot<TContext> | undefined]> {
	const result = await executeStep(step, context, workflowOptions);

	if (step.compensation) {
		const snapshot = createStepSnapshot(step.name, context, step.compensation);
		return [result, snapshot];
	}

	return [result, undefined];
}

/**
 * Execute all steps in a workflow definition
 *
 * Handles:
 * - Sequential step execution with context passing
 * - Compensation tracking (LIFO rollback on error)
 * - Error handling with automatic compensation
 * - Output building from final context
 *
 * @param definition - The workflow definition with steps
 * @param input - The workflow input
 * @returns The workflow output
 */
export async function executeWorkflowSteps<TInput, TOutput, TContext extends object = object>(
	definition: WorkflowDefinition<TInput, TOutput, TContext>,
	input: TInput
): Promise<TOutput> {
	// Initialize context with input
	const context: Record<string, unknown> = { input };

	// Track completed steps for compensation
	const completedSteps: CompletedStepSnapshot<TContext>[] = [];

	try {
		// Execute each step in order
		for (const step of definition.steps) {
			const [result, snapshot] = await executeStepWithCompensation(
				step as WorkflowStep<TContext>,
				context as TContext,
				definition.defaultActivityOptions ?? {}
			);

			// Store result in context if outputKey is defined
			// IMPORTANT: Must do this BEFORE tracking compensation snapshot
			// so the snapshot includes this step's output for compensation input
			if (step.outputKey && result !== undefined) {
				context[step.outputKey] = result;
			}

			// Track completed step with compensation
			// Snapshot now includes the step's output in context
			if (snapshot) {
				// Update snapshot with latest context that includes this step's output
				snapshot.contextSnapshot = { ...context } as TContext;
				completedSteps.push(snapshot);
			}
		}

		// Build final output
		if (definition.output) {
			return definition.output(context as TContext & { input: TInput });
		}

		// If no output function, return the last step's result or context
		return context as unknown as TOutput;
	} catch (error) {
		// Map Temporal error to WorkflowError for application layer
		const workflowError = safeMapError(error, {
			stepName: definition.name,
			details: { phase: 'workflow-execution' },
		});

		workflowLogger.error('Workflow execution failed', {
			error: workflowError.message,
			errorType: workflowError.type,
			completedStepsCount: completedSteps.length,
		});

		// Call application's error handler if defined
		let errorAction: 'compensate' | 'retry' | 'fail' | 'continue' = 'compensate';

		if (definition.onError) {
			try {
				const action = definition.onError(
					workflowError,
					context as TContext & { input: TInput },
					completedSteps as CompletedStepSnapshot<TContext & { input: TInput }>[]
				);
				// Handle both sync and async onError handlers
				errorAction = action instanceof Promise ? await action : action;
				workflowLogger.info('Error handler returned action', { action: errorAction });
			} catch (handlerError) {
				workflowLogger.error('Error handler failed', {
					error:
						handlerError instanceof Error ? handlerError.message : String(handlerError),
				});
				// Fall back to compensation if error handler fails
				errorAction = 'compensate';
			}
		}

		// Execute action based on error handler decision
		if (errorAction === 'compensate' && completedSteps.length > 0) {
			workflowLogger.info('Starting compensation', {
				stepsToCompensate: completedSteps.length,
			});

			// Execute compensations in reverse order (LIFO)
			await executeCompensations(completedSteps, definition.defaultActivityOptions, {
				timeout: TEMPORAL_CONFIG.activities.startToCloseTimeoutMs,
				retryPolicy: {
					maxAttempts: 3,
					initialInterval: 1000,
					maxInterval: 10000,
					backoffCoefficient: 2,
				},
			});

			workflowLogger.info('Compensation completed');
			// After compensation, fail the workflow permanently
			throw ApplicationFailure.nonRetryable(
				workflowError.message,
				'WorkflowFailedAfterCompensation',
				workflowError
			);
		} else if (errorAction === 'retry') {
			// Workflow-level retry is not supported - use activity retry policies instead
			// Activities should have retryPolicy.maxAttempts configured for automatic retries
			workflowLogger.error('Workflow-level retry is not supported', {
				hint: 'Use activity retryPolicy.maxAttempts for automatic retries',
			});
			throw ApplicationFailure.nonRetryable(
				`Workflow-level retry not supported. Use activity retry policies instead: ${workflowError.message}`,
				'UnsupportedRetryAction',
				workflowError
			);
		} else if (errorAction === 'continue') {
			workflowLogger.info('Continuing workflow despite error');
			// Return partial result or context
			if (definition.output) {
				return definition.output(context as TContext & { input: TInput });
			}
			return context as unknown as TOutput;
		} else if (errorAction === 'fail') {
			workflowLogger.info('Failing workflow as requested by error handler');
			// Throw ApplicationFailure to permanently fail the workflow execution
			// This prevents Temporal from retrying the workflow task
			throw ApplicationFailure.nonRetryable(
				workflowError.message,
				'WorkflowExecutionError',
				workflowError
			);
		}

		// This should never be reached - all error actions above either return or throw
		throw ApplicationFailure.nonRetryable(
			'Unknown error action: ' + errorAction,
			'UnknownErrorAction',
			workflowError
		);
	}
}

/**
 * Create a workflow executor for a specific definition
 *
 * This is the main entry point for converting a WorkflowDefinition
 * into a Temporal workflow function.
 *
 * Usage in Temporal workflow:
 * ```typescript
 * const executor = createWorkflowExecutor(paymentCreateWorkflowDefinition);
 * export const paymentCreateTemporalWorkflow = executor;
 * ```
 *
 * @param definition - The workflow definition to execute
 * @returns A Temporal workflow function
 */
export function createWorkflowExecutor<TInput, TOutput, TContext extends object>(
	definition: WorkflowDefinition<TInput, TOutput, TContext>
): (input: TInput) => Promise<TOutput> {
	return async (input: TInput): Promise<TOutput> => {
		workflowLogger.info('Starting workflow execution', {
			workflowName: definition.name,
			stepsCount: definition.steps.length,
		});

		const result = await executeWorkflowSteps(definition, input);

		workflowLogger.info('Workflow execution completed', {
			workflowName: definition.name,
		});

		return result;
	};
}
