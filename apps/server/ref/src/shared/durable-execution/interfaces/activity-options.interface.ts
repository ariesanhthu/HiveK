/**
 * Activity Options Interface
 *
 * Provider-agnostic configuration for activity execution.
 * These will be mapped to provider-specific options (e.g., Temporal) in infrastructure layer.
 */

/**
 * Retry policy for activity execution
 */
export interface RetryPolicy {
	/**
	 * Maximum number of retry attempts
	 * @default 3
	 */
	maxAttempts?: number;

	/**
	 * Initial retry interval in milliseconds
	 * @default 1000 (1 second)
	 */
	initialInterval?: number;

	/**
	 * Maximum retry interval in milliseconds
	 * @default 60000 (1 minute)
	 */
	maxInterval?: number;

	/**
	 * Backoff coefficient for exponential backoff
	 * @default 2.0
	 */
	backoffCoefficient?: number;
}

/**
 * Activity-level execution options
 */
export interface ActivityOptions {
	/**
	 * Maximum time the activity can run (start-to-close timeout, in milliseconds)
	 * @default 30000 (30 seconds)
	 */
	timeout?: number;

	/**
	 * Maximum time from schedule to start (in milliseconds)
	 * How long activity can wait in queue before being picked up by worker
	 * @default undefined (no limit)
	 */
	scheduleToStartTimeout?: number;

	/**
	 * Maximum time from schedule to close (in milliseconds)
	 * Total time including queue wait + execution
	 * @default undefined (no limit)
	 */
	scheduleToCloseTimeout?: number;

	/**
	 * Heartbeat timeout (in milliseconds)
	 * Maximum time between heartbeats before activity is considered failed
	 * @default undefined (no heartbeat required)
	 */
	heartbeatTimeout?: number;

	/**
	 * Enable automatic heartbeat
	 * If true, activity will automatically send heartbeats at regular intervals
	 * If false, activity must manually call context.heartbeat()
	 * @default true (when heartbeatTimeout is set)
	 */
	autoHeartbeat?: boolean;

	/**
	 * Interval for automatic heartbeats (in milliseconds)
	 * Only used when autoHeartbeat is true
	 * @default heartbeatTimeout * 0.8 (80% of timeout)
	 */
	autoHeartbeatInterval?: number;

	/**
	 * Retry policy for this activity
	 */
	retryPolicy?: RetryPolicy;
}

/**
 * Activity execution context
 * Provides runtime utilities for long-running activities
 *
 * **Design Principle**: Keep activities pure by making context optional
 * Activities should not require context for normal operation
 *
 * @example
 * ```typescript
 * // Activity without context (preferred for simple operations)
 * async function quickActivity(input: Input): Promise<Output> {
 *   return doWork(input);
 * }
 *
 * // Activity with context (for long-running operations)
 * async function longActivity(input: Input, context?: ActivityExecutionContext): Promise<Output> {
 *   for (const item of input.items) {
 *     // Send heartbeat to indicate progress
 *     context?.heartbeat({ processedItems: item.id });
 *
 *     // Check for cancellation
 *     if (context?.isCancelled()) {
 *       throw new Error('Activity cancelled');
 *     }
 *
 *     await processItem(item);
 *   }
 *   return result;
 * }
 * ```
 */
export interface ActivityExecutionContext {
	/**
	 * Send a heartbeat to indicate activity is still alive
	 *
	 * **Auto-heartbeat (default)**: Heartbeats sent automatically at regular intervals
	 * - No need to call this manually
	 * - Recommended for most activities
	 *
	 * **Manual heartbeat**: Set `autoHeartbeat: false` in ActivityOptions
	 * - Call this method periodically in long loops
	 * - Useful for reporting progress with details
	 *
	 * @param details - Optional progress details (serializable)
	 *
	 * @example
	 * ```typescript
	 * // Manual heartbeat with progress
	 * context.heartbeat({
	 *   processedRecords: 150,
	 *   totalRecords: 1000,
	 *   currentBatch: 2
	 * });
	 * ```
	 */
	heartbeat(details?: unknown): void;

	/**
	 * Check if activity has been cancelled
	 * Long-running activities should check this periodically
	 *
	 * @returns true if workflow requested cancellation
	 *
	 * @example
	 * ```typescript
	 * for (const item of largeList) {
	 *   if (context.isCancelled()) {
	 *     // Cleanup and exit gracefully
	 *     await cleanup();
	 *     throw new Error('Activity cancelled by user');
	 *   }
	 *   await processItem(item);
	 * }
	 * ```
	 */
	isCancelled(): boolean;
}

/**
 * ===============================================
 * HEARTBEAT USAGE GUIDE
 * ===============================================
 *
 * **When to use heartbeats:**
 * - Long-running activities (> 30 seconds)
 * - Activities processing large datasets
 * - Activities that could hang indefinitely
 * - Activities where you want progress tracking
 *
 * **Auto-heartbeat vs Manual:**
 *
 * Auto-heartbeat (recommended):
 * ```typescript
 * activityOptions: {
 *   timeout: 300000,        // 5 minutes
 *   heartbeatTimeout: 30000 // 30 seconds
 *   // autoHeartbeat: true  (default)
 * }
 * // No code changes needed - heartbeats sent automatically
 * ```
 *
 * Manual heartbeat (for progress reporting):
 * ```typescript
 * activityOptions: {
 *   timeout: 300000,
 *   heartbeatTimeout: 30000,
 *   autoHeartbeat: false     // Disable auto
 * }
 *
 * async function activity(input, context?: ActivityExecutionContext) {
 *   for (let i = 0; i < input.items.length; i++) {
 *     context?.heartbeat({ progress: i / input.items.length });
 *     await process(input.items[i]);
 *   }
 * }
 * ```
 *
 * **Best Practices:**
 * 1. Set heartbeatTimeout to 20-30% of total timeout
 * 2. Use auto-heartbeat unless you need progress details
 * 3. Always make context optional (context?: ActivityExecutionContext)
 * 4. Check isCancelled() in long loops
 * 5. Cleanup resources before throwing on cancellation
 */
