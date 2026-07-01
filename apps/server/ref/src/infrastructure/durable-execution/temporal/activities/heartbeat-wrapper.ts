/**
 * Heartbeat Activity Wrapper for Temporal
 *
 * Wraps activity functions to provide heartbeat support for long-running operations.
 * Integrates shared layer ActivityExecutionContext with Temporal's Context API.
 *
 * Features:
 * - Automatic heartbeat at configurable intervals
 * - Manual heartbeat with progress tracking
 * - Cancellation detection via Temporal's cancellation signal
 * - Seamless integration with existing activities
 * - Optional context parameter (activities remain pure)
 */

import { Context } from '@temporalio/activity';
import type { ActivityExecutionContext } from '@/shared/durable-execution/interfaces';
import { toError } from '@/shared/utils/error.util';

/**
 * Configuration for heartbeat wrapper
 */
export interface HeartbeatConfig {
	/**
	 * Enable automatic heartbeat
	 * If true, heartbeats are sent at regular intervals without manual calls
	 * @default true (when heartbeatTimeout is configured)
	 */
	autoHeartbeat?: boolean;

	/**
	 * Interval for automatic heartbeats (in milliseconds)
	 * Only used when autoHeartbeat is true
	 * @default heartbeatTimeout * 0.8 (80% of timeout)
	 */
	autoHeartbeatInterval?: number;

	/**
	 * Heartbeat timeout (in milliseconds)
	 * Maximum time between heartbeats before activity is considered failed
	 * If not provided, heartbeat is disabled
	 */
	heartbeatTimeout?: number;
}

/**
 * Implementation of ActivityExecutionContext for Temporal
 *
 * Bridges shared layer interface with Temporal-specific APIs
 */
class TemporalActivityContext implements ActivityExecutionContext {
	private heartbeatTimer?: NodeJS.Timeout;
	private lastHeartbeatDetails?: unknown;

	constructor(private config: HeartbeatConfig) {
		// Start auto-heartbeat if enabled
		if (this.config.autoHeartbeat && this.config.autoHeartbeatInterval) {
			this.startAutoHeartbeat();
		}
	}

	/**
	 * Send heartbeat to Temporal
	 * Can be called manually or automatically depending on config
	 */
	heartbeat(details?: unknown): void {
		try {
			// Store details for potential retry
			this.lastHeartbeatDetails = details;

			// Send heartbeat to Temporal
			Context.current().heartbeat(details);
		} catch (error) {
			// Heartbeat can fail if activity is already cancelled or completed
			// Log but don't throw to avoid breaking activity execution
			console.warn('Heartbeat failed:', error);
		}
	}

	/**
	 * Check if activity has been cancelled by workflow
	 */
	isCancelled(): boolean {
		try {
			const context = Context.current();
			// Check if cancellation signal has been triggered
			return context.cancellationSignal.aborted;
		} catch {
			// If we can't access context, assume not cancelled
			return false;
		}
	}

	/**
	 * Start automatic heartbeat timer
	 */
	private startAutoHeartbeat(): void {
		const interval = this.config.autoHeartbeatInterval!;

		this.heartbeatTimer = setInterval(() => {
			this.heartbeat(this.lastHeartbeatDetails);
		}, interval);

		// Clean up timer on activity completion
		Context.current().cancellationSignal.addEventListener('abort', () => {
			this.stopAutoHeartbeat();
		});
	}

	/**
	 * Stop automatic heartbeat timer
	 */
	private stopAutoHeartbeat(): void {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = undefined;
		}
	}

	/**
	 * Clean up resources
	 * Should be called when activity completes
	 */
	dispose(): void {
		this.stopAutoHeartbeat();
	}
}

/**
 * Wrap an activity function with heartbeat support
 *
 * The wrapper automatically injects ActivityExecutionContext as the last parameter
 * if the activity function accepts it.
 *
 * @param activityFn - The activity function to wrap
 * @param config - Heartbeat configuration
 * @returns Wrapped activity function with heartbeat support
 *
 * @example
 * ```typescript
 * // Activity that accepts context
 * async function processLargeDataset(
 *   input: { items: string[] },
 *   context?: ActivityExecutionContext
 * ): Promise<void> {
 *   for (const item of input.items) {
 *     if (context?.isCancelled()) {
 *       throw new Error('Processing cancelled');
 *     }
 *     context?.heartbeat({ processed: item });
 *     await processItem(item);
 *   }
 * }
 *
 * // Wrap with heartbeat support
 * const wrappedActivity = withHeartbeat(processLargeDataset, {
 *   autoHeartbeat: false, // Manual heartbeat
 *   heartbeatTimeout: 30000
 * });
 * ```
 */
export function withHeartbeat<TInput, TOutput>(
	activityFn: (input: TInput, context?: ActivityExecutionContext) => Promise<TOutput>,
	config: HeartbeatConfig
): (input: TInput) => Promise<TOutput> {
	return async (input: TInput): Promise<TOutput> => {
		// Skip heartbeat if not configured
		if (!config.heartbeatTimeout) {
			return activityFn(input);
		}

		// Calculate auto-heartbeat interval if not provided
		const autoHeartbeatInterval = config.autoHeartbeatInterval || config.heartbeatTimeout * 0.8;

		// Create context with full config
		const fullConfig: HeartbeatConfig = {
			autoHeartbeat: config.autoHeartbeat ?? true, // Default: true
			autoHeartbeatInterval,
			heartbeatTimeout: config.heartbeatTimeout,
		};

		const context = new TemporalActivityContext(fullConfig);

		try {
			// Call activity with context
			const result = await activityFn(input, context);

			// Clean up
			context.dispose();

			return result;
		} catch (error) {
			// Clean up on error
			context.dispose();
			throw toError(error);
		}
	};
}

/**
 * Create a heartbeat context without wrapping an activity
 *
 * Useful for activities that want to manually manage the context lifecycle
 * or when you need more control over context creation.
 *
 * @param config - Heartbeat configuration
 * @returns ActivityExecutionContext instance
 *
 * @example
 * ```typescript
 * async function myActivity(input: Data): Promise<Result> {
 *   const context = createHeartbeatContext({
 *     autoHeartbeat: true,
 *     heartbeatTimeout: 30000
 *   });
 *
 *   try {
 *     for (const item of input.items) {
 *       if (context.isCancelled()) break;
 *       await process(item);
 *     }
 *     return result;
 *   } finally {
 *     context.dispose();
 *   }
 * }
 * ```
 */
export function createHeartbeatContext(config: HeartbeatConfig): TemporalActivityContext {
	// Calculate auto-heartbeat interval if not provided
	const autoHeartbeatInterval =
		config.autoHeartbeatInterval ||
		(config.heartbeatTimeout ? config.heartbeatTimeout * 0.8 : undefined);

	const fullConfig: HeartbeatConfig = {
		autoHeartbeat: config.autoHeartbeat ?? true,
		autoHeartbeatInterval,
		heartbeatTimeout: config.heartbeatTimeout,
	};

	return new TemporalActivityContext(fullConfig);
}

/**
 * Get current activity context from Temporal
 *
 * This is a low-level utility for accessing Temporal's Context.current()
 * Most activities should use withHeartbeat() or createHeartbeatContext() instead.
 *
 * @returns Temporal activity context info
 */
export function getCurrentActivityInfo() {
	try {
		const context = Context.current();
		return {
			activityId: context.info.activityId,
			activityType: context.info.activityType,
			attempt: context.info.attempt,
			isLocal: context.info.isLocal,
			workflowExecution: context.info.workflowExecution,
		};
	} catch {
		return null;
	}
}
