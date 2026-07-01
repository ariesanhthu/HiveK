export enum ERetryBackoffStrategy {
	FIXED = 'fixed',
	EXPONENTIAL = 'exponential',
}

export interface IRetryOptions {
	maxAttempts?: number;
	timeoutMs?: number;
	delayMs?: number; // Initial delay before the first retry
	backoffStrategy?: ERetryBackoffStrategy;
	jitter?: boolean;
	maxDelayMs?: number; // Only applicable for exponential backoff

	onRetry?: (attempt: number, error: Error) => void; // Callback invoked before each retry attempt
	shouldRetry?: (error: Error, attempt: number) => boolean; // Function to determine if a retry should occur based on the error and attempt number
}

export interface IRetry {
	execute<T>(fn: () => Promise<T>, options?: IRetryOptions): Promise<T>;
	calculateDelay(attempt: number, options: IRetryOptions): number;
	executeWithFallback?<T>(
		fn: () => Promise<T>,
		fallback: () => Promise<T>,
		options?: IRetryOptions
	): Promise<T>;
}
