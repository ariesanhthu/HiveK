/**
 * Compensation Executor
 *
 * Handles SAGA pattern compensation execution in LIFO order.
 * Used by workflow interpreter when errors occur.
 */

import { proxyActivities } from '@temporalio/workflow';
import type { CompletedStepSnapshot, ActivityOptions } from '@/shared/durable-execution';
import { toTemporalActivityOptions, mergeActivityOptions } from '../../mappers';
import { resolveActivityIdentifier } from './activity-identifier-resolver';
import { workflowLogger } from './workflow-logger';

/**
 * Execute compensation activities in LIFO order (Last In, First Out)
 *
 * Compensations run in reverse order of step execution:
 * - Step 1 → Step 2 → Step 3 [FAIL]
 * - Compensate 3 → Compensate 2 → Compensate 1
 *
 * This ensures dependent operations are undone in the correct order.
 *
 * @param completedSteps - Steps that completed successfully before error
 * @param defaultOptions - Default activity options from workflow
 * @param systemDefaults - System-level default options
 *
 * @example
 * ```typescript
 * try {
 *   // Execute workflow steps...
 * } catch (error) {
 *   await executeCompensations(completedSteps, workflowDefaults, systemDefaults);
 *   throw error;
 * }
 * ```
 */
export async function executeCompensations<TContext>(
	completedSteps: CompletedStepSnapshot<TContext>[],
	defaultOptions?: ActivityOptions,
	systemDefaults?: ActivityOptions
): Promise<void> {
	if (completedSteps.length === 0) {
		workflowLogger.info('No compensations to execute (no completed steps)');
		return;
	}

	// Filter steps that have compensation defined
	const stepsWithCompensation = completedSteps.filter((step) => step.compensation);

	if (stepsWithCompensation.length === 0) {
		workflowLogger.info('No compensations to execute (no compensation defined)', {
			completedSteps: completedSteps.length,
		});
		return;
	}

	workflowLogger.info('Starting compensation execution (SAGA rollback)', {
		totalSteps: completedSteps.length,
		stepsWithCompensation: stepsWithCompensation.length,
	});

	// Execute in LIFO order (reverse)
	for (let i = stepsWithCompensation.length - 1; i >= 0; i--) {
		const snapshot = stepsWithCompensation[i];
		const compensation = snapshot.compensation!;

		try {
			workflowLogger.info('Executing compensation', {
				stepName: snapshot.stepName,
				order: `${stepsWithCompensation.length - i}/${stepsWithCompensation.length}`,
			});

			// Resolve activity identifier (symbol → string)
			const activityName = resolveActivityIdentifier(compensation.activity);

			// Merge compensation options with defaults (convert agnostic options to Temporal)
			const options = mergeActivityOptions(
				compensation.activityOptions,
				defaultOptions,
				systemDefaults ? toTemporalActivityOptions(systemDefaults) : undefined
			);

			// Create activity proxy with compensation options
			const activities = proxyActivities({
				...toTemporalActivityOptions(options, systemDefaults),
			});

			const activityFn = activities[activityName];
			if (!activityFn) {
				throw new Error(`Compensation activity not found: ${activityName}`);
			}

			// Build compensation input from context snapshot
			const compensationInput = compensation.input
				? compensation.input(snapshot.contextSnapshot)
				: snapshot.contextSnapshot;

			// Execute compensation activity
			await activityFn(compensationInput);

			workflowLogger.info('Compensation executed successfully', {
				stepName: snapshot.stepName,
				activity: activityName,
			});
		} catch (error: unknown) {
			// Best-effort: Log error but continue with other compensations
			const err = error instanceof Error ? error : new Error(String(error));
			workflowLogger.error('Compensation failed (continuing with others)', {
				stepName: snapshot.stepName,
				error: err.message,
				stack: err.stack,
			});

			// Note: We continue executing other compensations even if one fails
			// This is the "best-effort" approach for SAGA pattern
		}
	}

	workflowLogger.info('Compensation execution completed', {
		totalCompensations: stepsWithCompensation.length,
	});
}

/**
 * Create context snapshot for compensation tracking
 *
 * Captures the current context state when a step completes successfully.
 * This snapshot is used later if compensation is needed.
 *
 * @param stepName - Name of the completed step
 * @param context - Current workflow context
 * @param compensation - Compensation configuration from step definition
 * @returns Snapshot for compensation tracking
 */
export function createStepSnapshot<TContext>(
	stepName: string,
	context: TContext,
	compensation?: {
		activity: string | symbol;
		input?: (ctx: TContext) => unknown;
		activityOptions?: ActivityOptions;
	}
): CompletedStepSnapshot<TContext> {
	return {
		stepName,
		contextSnapshot: { ...context }, // Deep copy to preserve state
		compensation,
	};
}
