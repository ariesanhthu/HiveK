/**
 * Activity Options Mapper
 *
 * Converts provider-agnostic ActivityOptions to Temporal-specific ActivityOptions.
 * Handles timeout conversions (milliseconds → duration strings) and option merging.
 */

import type { ActivityOptions as TemporalActivityOptions } from '@temporalio/workflow';
import type { ActivityOptions, RetryPolicy } from '@/shared/durable-execution';

/**
 * Convert milliseconds to Temporal duration string
 *
 * @param ms - Duration in milliseconds
 * @returns Temporal duration string (e.g., "30s", "1m", "2h")
 *
 * @example
 * ```typescript
 * millisecondsToDuration(1000)   // "1s"
 * millisecondsToDuration(60000)  // "1m"
 * millisecondsToDuration(90000)  // "1m 30s"
 * millisecondsToDuration(3600000) // "1h"
 * ```
 */
export function millisecondsToDuration(ms: number): string {
	if (ms < 1000) {
		return `${ms}ms`;
	}

	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		const remainingHours = hours % 24;
		return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
	}

	if (hours > 0) {
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	}

	if (minutes > 0) {
		const remainingSeconds = seconds % 60;
		return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
	}

	return `${seconds}s`;
}

/**
 * Convert agnostic RetryPolicy to Temporal RetryPolicy
 *
 * @param policy - Provider-agnostic retry policy
 * @returns Temporal retry policy
 */
export function toTemporalRetryPolicy(
	policy: RetryPolicy | undefined
): TemporalActivityOptions['retry'] {
	if (!policy) {
		return undefined;
	}

	return {
		maximumAttempts: policy.maxAttempts,
		initialInterval: policy.initialInterval
			? millisecondsToDuration(policy.initialInterval)
			: undefined,
		maximumInterval: policy.maxInterval
			? millisecondsToDuration(policy.maxInterval)
			: undefined,
		backoffCoefficient: policy.backoffCoefficient,
	};
}

/**
 * Convert agnostic ActivityOptions to Temporal ActivityOptions
 *
 * Maps provider-agnostic activity options to Temporal-specific format:
 * - Converts milliseconds to duration strings
 * - Maps field names (timeout → startToCloseTimeout)
 * - Handles retry policy conversion
 *
 * @param options - Provider-agnostic activity options
 * @param defaults - Default Temporal activity options to merge with
 * @returns Temporal activity options
 *
 * @example
 * ```typescript
 * const agnosticOptions: ActivityOptions = {
 *   timeout: 60000,
 *   heartbeatTimeout: 10000,
 *   retryPolicy: {
 *     maxAttempts: 5,
 *     initialInterval: 1000,
 *     backoffCoefficient: 2,
 *   },
 * };
 *
 * const temporalOptions = toTemporalActivityOptions(agnosticOptions, defaults);
 * // Result:
 * // {
 * //   startToCloseTimeout: "1m",
 * //   heartbeatTimeout: "10s",
 * //   retry: {
 * //     maximumAttempts: 5,
 * //     initialInterval: "1s",
 * //     backoffCoefficient: 2,
 * //   },
 * // }
 * ```
 */
export function toTemporalActivityOptions(
	options: ActivityOptions | undefined,
	defaults?: TemporalActivityOptions
): TemporalActivityOptions {
	// If no options provided, return defaults
	if (!options) {
		return defaults || {};
	}

	const temporalOptions: TemporalActivityOptions = {
		...defaults,
	};

	// Map timeout → startToCloseTimeout (primary timeout)
	if (options.timeout !== undefined) {
		temporalOptions.startToCloseTimeout = millisecondsToDuration(options.timeout);
	}

	// Map scheduleToStartTimeout (queue timeout)
	if (options.scheduleToStartTimeout !== undefined) {
		temporalOptions.scheduleToStartTimeout = millisecondsToDuration(
			options.scheduleToStartTimeout
		);
	}

	// Map scheduleToCloseTimeout (total timeout)
	if (options.scheduleToCloseTimeout !== undefined) {
		temporalOptions.scheduleToCloseTimeout = millisecondsToDuration(
			options.scheduleToCloseTimeout
		);
	}

	// Map heartbeatTimeout
	if (options.heartbeatTimeout !== undefined) {
		temporalOptions.heartbeatTimeout = millisecondsToDuration(options.heartbeatTimeout);
	}

	// Map retry policy
	if (options.retryPolicy !== undefined) {
		temporalOptions.retry = toTemporalRetryPolicy(options.retryPolicy);
	}

	return temporalOptions;
}

/**
 * Merge step-level options with workflow-level defaults
 *
 * Priority: Step options > Workflow defaults > System defaults
 *
 * @param stepOptions - Activity options from workflow step
 * @param workflowDefaults - Default activity options from workflow definition
 * @param systemDefaults - System-level default options (from config)
 * @returns Merged Temporal activity options
 *
 * @example
 * ```typescript
 * const stepOptions = { timeout: 60000 };
 * const workflowDefaults = { timeout: 30000, heartbeatTimeout: 10000 };
 * const systemDefaults = { startToCloseTimeout: "1m" };
 *
 * const merged = mergeActivityOptions(stepOptions, workflowDefaults, systemDefaults);
 * // Result:
 * // {
 * //   startToCloseTimeout: "1m",     // From step (overrides workflow)
 * //   heartbeatTimeout: "10s",       // From workflow defaults
 * // }
 * ```
 */
export function mergeActivityOptions(
	stepOptions?: ActivityOptions,
	workflowDefaults?: ActivityOptions,
	systemDefaults?: TemporalActivityOptions
): TemporalActivityOptions {
	// Start with system defaults
	let result = { ...systemDefaults };

	// Apply workflow-level defaults
	if (workflowDefaults) {
		const workflowTemporal = toTemporalActivityOptions(workflowDefaults);
		result = {
			...result,
			...workflowTemporal,
		};
	}

	// Apply step-level options (highest priority)
	if (stepOptions) {
		const stepTemporal = toTemporalActivityOptions(stepOptions);
		result = {
			...result,
			...stepTemporal,
		};
	}

	return result;
}

/**
 * Calculate auto-heartbeat interval from heartbeat timeout
 *
 * Default: 80% of heartbeatTimeout to ensure heartbeat arrives before timeout
 *
 * @param heartbeatTimeout - Heartbeat timeout in milliseconds
 * @returns Auto-heartbeat interval in milliseconds
 *
 * @example
 * ```typescript
 * calculateAutoHeartbeatInterval(30000)  // 24000 (24 seconds)
 * calculateAutoHeartbeatInterval(10000)  // 8000 (8 seconds)
 * ```
 */
export function calculateAutoHeartbeatInterval(heartbeatTimeout: number): number {
	return Math.floor(heartbeatTimeout * 0.8);
}

/**
 * Check if activity options require heartbeat support
 *
 * @param options - Activity options to check
 * @returns true if heartbeat is configured
 */
export function requiresHeartbeat(options?: ActivityOptions): boolean {
	return options?.heartbeatTimeout !== undefined && options.heartbeatTimeout > 0;
}

/**
 * Check if activity uses auto-heartbeat mode
 *
 * @param options - Activity options to check
 * @returns true if auto-heartbeat is enabled (default when heartbeat is configured)
 */
export function usesAutoHeartbeat(options?: ActivityOptions): boolean {
	if (!requiresHeartbeat(options)) {
		return false;
	}

	// Default to true if heartbeatTimeout is set but autoHeartbeat is not specified
	return options!.autoHeartbeat !== false;
}
