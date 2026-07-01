export enum ECuircuitState {
	OPEN = 'open',
	CLOSED = 'closed',
	HALF_OPEN = 'half-open',
}

export interface ICircuitBreakerOptions {
	failureThreshold?: number; // Number of consecutive failures to trip breaker (default: 5)
	successThreshold?: number; // Number of successes in half-open to close (default: 2)
	resetTimeoutMs?: number; // Time to wait before half-open attempt (default: 60000)
	timeoutMs?: number; // Timeout for each execution (default: 30000)
	onStateChange?: (serviceName: string, from: ECuircuitState, to: ECuircuitState) => void; // Callback for monitoring
}

export interface ICircuitState {
	state: ECuircuitState;
	failureCount: number;
	successCount: number;
	lastFailureTime: number | null;
	lastStateChangeTime: number; // Track when state last changed
	nextAttemptTime: number | null; // When to attempt half-open
}

export interface ICircuitBreaker {
	// Core execution
	execute<T>(
		fn: () => Promise<T>,
		serviceName: string,
		options?: ICircuitBreakerOptions
	): Promise<T>;

	// State queries
	getState(serviceName: string): ECuircuitState;
	isOpen(serviceName: string): boolean;
	isClosed(serviceName: string): boolean;
	isHalfOpen(serviceName: string): boolean;

	// State transitions (should be internal, but exposed for testing/manual control)
	open(serviceName: string): void;
	close(serviceName: string): void;
	halfOpen(serviceName: string): void;

	// Recording outcomes
	recordSuccess(serviceName: string): void;
	recordFailure(serviceName: string, error?: Error): void;

	// Metrics
	getFailureCount(serviceName: string): number;
	getSuccessCount(serviceName: string): number;
	getLastFailureTime(serviceName: string): number | null;

	// Management
	reset(serviceName: string): void;
	resetAll(): void;
	getAllStates(): Map<string, ICircuitState>;
}
