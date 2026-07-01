/**
 * Temporal Configuration
 */
const getEnv = (key: string, defaultValue: string): string => {
	if (typeof process !== 'undefined' && process.env) {
		return process.env[key] || defaultValue;
	}
	return defaultValue;
};

export const TEMPORAL_CONFIG = {
	address: getEnv('TEMPORAL_ADDRESS', '10.10.0.2:7233'),
	namespace: getEnv('TEMPORAL_NAMESPACE', 'default'),
	taskQueue: getEnv('TEMPORAL_TASK_QUEUE', 'payment-queue'),
	activities: {
		startToCloseTimeout: '1 minute',
		/** Same window as `startToCloseTimeout`, in ms (for ActivityOptions.timeout) */
		startToCloseTimeoutMs: 60_000,
	},
	workflows: {
		workflowExecutionTimeout: '10 minutes',
	},
};

export const DEFAULT_ACTIVITY_OPTIONS = {
	startToCloseTimeout: TEMPORAL_CONFIG.activities.startToCloseTimeout,
	retry: {
		maximumAttempts: 3,
		initialInterval: '1s',
		maximumInterval: '10s',
		backoffCoefficient: 2,
	},
};
