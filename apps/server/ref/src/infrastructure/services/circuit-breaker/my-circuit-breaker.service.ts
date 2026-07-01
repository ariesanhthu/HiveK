import { Injectable, Logger } from '@nestjs/common';
import {
	ICircuitBreaker,
	ICircuitBreakerOptions,
	ICircuitState,
	ECuircuitState,
} from '@/shared/interfaces/circuit-breaker.interface';
import { toError } from '@/shared/utils/error.util';

@Injectable()
export class MyCircuitBreakerService implements ICircuitBreaker {
	private readonly logger = new Logger(MyCircuitBreakerService.name);
	private readonly circuits = new Map<string, ICircuitState>();
	private readonly defaultOptions: Required<ICircuitBreakerOptions> = {
		failureThreshold: 5,
		successThreshold: 2,
		resetTimeoutMs: 60000,
		timeoutMs: 30000,
		onStateChange: () => {},
	};

	/**
	 * Execute a function with circuit breaker protection
	 */
	async execute<T>(
		fn: () => Promise<T>,
		serviceName: string,
		options?: ICircuitBreakerOptions
	): Promise<T> {
		const opts = { ...this.defaultOptions, ...options };
		const state = this.getOrCreateCircuitState(serviceName);

		// Check if circuit is open
		if (this.isOpen(serviceName)) {
			// Check if enough time has passed to try half-open
			const now = Date.now();
			if (state.nextAttemptTime && now >= state.nextAttemptTime) {
				this.halfOpen(serviceName);
			} else {
				const waitTime = state.nextAttemptTime
					? Math.ceil((state.nextAttemptTime - now) / 1000)
					: 0;
				throw new Error(
					`Circuit breaker is OPEN for service "${serviceName}". Retry in ${waitTime}s`
				);
			}
		}

		// Execute with timeout
		try {
			const result = await this.executeWithTimeout(fn, opts.timeoutMs);
			this.recordSuccess(serviceName);

			// Check if we should close the circuit (from half-open)
			if (this.isHalfOpen(serviceName) && state.successCount >= opts.successThreshold) {
				this.close(serviceName);
			}

			return result;
		} catch (error) {
			this.recordFailure(serviceName, error as Error);

			// Check if we should open the circuit
			if (this.isClosed(serviceName) && state.failureCount >= opts.failureThreshold) {
				this.open(serviceName);
			} else if (this.isHalfOpen(serviceName)) {
				// Any failure in half-open returns to open
				this.open(serviceName);
			}

			throw toError(error);
		}
	}

	/**
	 * Execute function with timeout
	 */
	private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
		return Promise.race([
			fn(),
			new Promise<T>((_, reject) =>
				setTimeout(() => {
					reject(new Error(`Operation timed out after ${timeoutMs}ms`));
				}, timeoutMs)
			),
		]);
	}

	/**
	 * Get circuit state for a service
	 */
	getState(serviceName: string): ECuircuitState {
		const state = this.circuits.get(serviceName);
		return state ? state.state : ECuircuitState.CLOSED;
	}

	/**
	 * Check if circuit is open
	 */
	isOpen(serviceName: string): boolean {
		return this.getState(serviceName) === ECuircuitState.OPEN;
	}

	/**
	 * Check if circuit is closed
	 */
	isClosed(serviceName: string): boolean {
		return this.getState(serviceName) === ECuircuitState.CLOSED;
	}

	/**
	 * Check if circuit is half-open
	 */
	isHalfOpen(serviceName: string): boolean {
		return this.getState(serviceName) === ECuircuitState.HALF_OPEN;
	}

	/**
	 * Transition circuit to OPEN state
	 */
	open(serviceName: string): void {
		const state = this.getOrCreateCircuitState(serviceName);
		const previousState = state.state;

		if (previousState === ECuircuitState.OPEN) {
			return; // Already open
		}

		const now = Date.now();
		state.state = ECuircuitState.OPEN;
		state.lastStateChangeTime = now;
		state.nextAttemptTime = now + this.defaultOptions.resetTimeoutMs;

		this.logger.warn(
			`Circuit breaker OPENED for service "${serviceName}" after ${state.failureCount} failures`
		);

		this.defaultOptions.onStateChange(serviceName, previousState, ECuircuitState.OPEN);
	}

	/**
	 * Transition circuit to CLOSED state
	 */
	close(serviceName: string): void {
		const state = this.getOrCreateCircuitState(serviceName);
		const previousState = state.state;

		if (previousState === ECuircuitState.CLOSED) {
			return; // Already closed
		}

		state.state = ECuircuitState.CLOSED;
		state.failureCount = 0;
		state.successCount = 0;
		state.lastFailureTime = null;
		state.lastStateChangeTime = Date.now();
		state.nextAttemptTime = null;

		this.logger.log(
			`Circuit breaker CLOSED for service "${serviceName}" after ${state.successCount} successes`
		);

		this.defaultOptions.onStateChange(serviceName, previousState, ECuircuitState.CLOSED);
	}

	/**
	 * Transition circuit to HALF_OPEN state
	 */
	halfOpen(serviceName: string): void {
		const state = this.getOrCreateCircuitState(serviceName);
		const previousState = state.state;

		if (previousState === ECuircuitState.HALF_OPEN) {
			return; // Already half-open
		}

		state.state = ECuircuitState.HALF_OPEN;
		state.successCount = 0;
		state.failureCount = 0;
		state.lastStateChangeTime = Date.now();
		state.nextAttemptTime = null;

		this.logger.log(
			`Circuit breaker HALF-OPEN for service "${serviceName}", testing connection...`
		);

		this.defaultOptions.onStateChange(serviceName, previousState, ECuircuitState.HALF_OPEN);
	}

	/**
	 * Record a successful execution
	 */
	recordSuccess(serviceName: string): void {
		const state = this.getOrCreateCircuitState(serviceName);

		if (state.state === ECuircuitState.HALF_OPEN) {
			state.successCount++;
			this.logger.debug(
				`Success recorded for "${serviceName}" in HALF-OPEN state (${state.successCount}/${this.defaultOptions.successThreshold})`
			);
		} else if (state.state === ECuircuitState.CLOSED) {
			// Reset failure count on success in closed state
			if (state.failureCount > 0) {
				state.failureCount = 0;
			}
		}
	}

	/**
	 * Record a failed execution
	 */
	recordFailure(serviceName: string, error?: Error): void {
		const state = this.getOrCreateCircuitState(serviceName);
		state.failureCount++;
		state.lastFailureTime = Date.now();

		this.logger.warn(
			`Failure recorded for "${serviceName}" (${state.failureCount}/${this.defaultOptions.failureThreshold}): ${error?.message || 'Unknown error'}`
		);
	}

	/**
	 * Get failure count for a service
	 */
	getFailureCount(serviceName: string): number {
		const state = this.circuits.get(serviceName);
		return state ? state.failureCount : 0;
	}

	/**
	 * Get success count for a service
	 */
	getSuccessCount(serviceName: string): number {
		const state = this.circuits.get(serviceName);
		return state ? state.successCount : 0;
	}

	/**
	 * Get last failure time for a service
	 */
	getLastFailureTime(serviceName: string): number | null {
		const state = this.circuits.get(serviceName);
		return state ? state.lastFailureTime : null;
	}

	/**
	 * Reset circuit to initial closed state
	 */
	reset(serviceName: string): void {
		const state = this.circuits.get(serviceName);
		if (!state) {
			return;
		}

		const previousState = state.state;

		state.state = ECuircuitState.CLOSED;
		state.failureCount = 0;
		state.successCount = 0;
		state.lastFailureTime = null;
		state.lastStateChangeTime = Date.now();
		state.nextAttemptTime = null;

		this.logger.log(`Circuit breaker RESET for service "${serviceName}"`);

		if (previousState !== ECuircuitState.CLOSED) {
			this.defaultOptions.onStateChange(serviceName, previousState, ECuircuitState.CLOSED);
		}
	}

	/**
	 * Reset all circuits
	 */
	resetAll(): void {
		const serviceNames = Array.from(this.circuits.keys());
		serviceNames.forEach((serviceName) => {
			this.reset(serviceName);
		});
		this.logger.log(`All circuit breakers RESET (${serviceNames.length} services)`);
	}

	/**
	 * Get all circuit states
	 */
	getAllStates(): Map<string, ICircuitState> {
		return new Map(this.circuits);
	}

	/**
	 * Get or create circuit state for a service
	 */
	private getOrCreateCircuitState(serviceName: string): ICircuitState {
		let state = this.circuits.get(serviceName);

		if (!state) {
			state = {
				state: ECuircuitState.CLOSED,
				failureCount: 0,
				successCount: 0,
				lastFailureTime: null,
				lastStateChangeTime: Date.now(),
				nextAttemptTime: null,
			};
			this.circuits.set(serviceName, state);
			this.logger.debug(`Initialized circuit breaker for service "${serviceName}"`);
		}

		return state;
	}
}
