/**
 * Workflow Logger
 *
 * Temporal-safe logging utility for workflow code.
 * Uses Temporal's built-in logger which is deterministic and replay-safe.
 *
 * ⚠️ IMPORTANT: Never use console.log() or NestJS Logger in workflow code!
 * They are non-deterministic and will cause workflow replay issues.
 */

import { log as temporalLog } from '@temporalio/workflow';

/**
 * Workflow-safe logger that wraps Temporal's logger
 * All logs are captured in Temporal UI and replayed correctly
 */
export const workflowLogger = {
	/**
	 * Log informational message
	 *
	 * @param message - Log message
	 * @param meta - Additional metadata (must be JSON-serializable)
	 */
	info: (message: string, meta?: Record<string, unknown>): void => {
		temporalLog.info(message, meta);
	},

	/**
	 * Log warning message
	 *
	 * @param message - Log message
	 * @param meta - Additional metadata (must be JSON-serializable)
	 */
	warn: (message: string, meta?: Record<string, unknown>): void => {
		temporalLog.warn(message, meta);
	},

	/**
	 * Log error message
	 *
	 * @param message - Log message
	 * @param meta - Additional metadata (must be JSON-serializable)
	 */
	error: (message: string, meta?: Record<string, unknown>): void => {
		temporalLog.error(message, meta);
	},

	/**
	 * Log debug message
	 *
	 * @param message - Log message
	 * @param meta - Additional metadata (must be JSON-serializable)
	 */
	debug: (message: string, meta?: Record<string, unknown>): void => {
		temporalLog.debug(message, meta);
	},
};

/**
 * ===============================================
 * USAGE GUIDELINES
 * ===============================================
 *
 * ✅ DO:
 * ```typescript
 * import { workflowLogger } from './workflow-logger';
 *
 * workflowLogger.info('Executing step', { stepName: 'validate' });
 * workflowLogger.error('Step failed', { error: error.message });
 * ```
 *
 * ❌ DON'T:
 * ```typescript
 * console.log('Executing step');           // Non-deterministic!
 * logger.info('Executing step');           // NestJS logger not available
 * workflowLogger.info('Step', { date: new Date() }); // Date is non-deterministic
 * ```
 *
 * IMPORTANT RULES:
 * 1. Only log JSON-serializable data
 * 2. Never log Date objects (use timestamps instead)
 * 3. Never log functions or class instances
 * 4. Keep log data small (large logs slow down replay)
 */
