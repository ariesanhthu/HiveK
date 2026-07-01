import { Injectable, Logger } from '@nestjs/common';
import { IRetry, IRetryOptions, ERetryBackoffStrategy } from '@/shared/interfaces/retry.interface';
import { sleep } from '@/shared/utils/sleep';

@Injectable()
export class MyRetryService implements IRetry {
	private readonly logger = new Logger(MyRetryService.name);
	private readonly defaultOptions: Required<IRetryOptions> = {
		backoffStrategy: ERetryBackoffStrategy.FIXED,
		maxAttempts: 3,
		delayMs: 1000,
		timeoutMs: 5000,
		jitter: false,
		maxDelayMs: 30000,
		shouldRetry: () => true,
		onRetry: () => {},
	};

	async execute<T>(fn: () => Promise<T>, options?: IRetryOptions): Promise<T> {
		const opts = { ...this.defaultOptions, ...options };

		// Implementation of the execute method goes here
		for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
			try {
				const result = await Promise.race([
					fn(),
					opts.timeoutMs
						? new Promise<never>((_, reject) =>
								setTimeout(() => {
									reject(new Error('Operation timed out'));
								}, opts.timeoutMs)
							)
						: new Promise<never>(() => {}),
				]);
				return result;
			} catch (error: unknown) {
				const err = error instanceof Error ? error : new Error(String(error));
				if (attempt === opts.maxAttempts) {
					this.logger.warn(`All ${opts.maxAttempts} retry attempts failed.`, err.stack);
					break;
				}

				if (!opts.shouldRetry(err, attempt)) {
					this.logger.warn(
						`Retry attempt ${attempt} failed and will not be retried.`,
						err.stack
					);
					throw err;
				}

				opts.onRetry(attempt, err);
				const delay = this.calculateDelay(attempt, opts);
				await sleep(delay);
			}
		}
		throw new Error('Max retry attempts exceeded');
	}

	calculateDelay(attempt: number, options: IRetryOptions): number {
		const { delayMs, backoffStrategy, maxDelayMs, jitter } = options;
		let tempDelay: number;
		switch (backoffStrategy) {
			case ERetryBackoffStrategy.EXPONENTIAL: {
				const baseDelay = delayMs ?? this.defaultOptions.delayMs;
				const calculatedDelay = baseDelay * Math.pow(2, attempt - 1);
				tempDelay = Math.min(calculatedDelay, maxDelayMs ?? this.defaultOptions.maxDelayMs);
				break;
			}
			default: // "fixed" as default
				tempDelay = delayMs ?? this.defaultOptions.delayMs;
		}
		if (jitter) {
			const jitterValue = Math.random() * (tempDelay / 2);
			return tempDelay + jitterValue;
		}
		return tempDelay;
	}

	executeWithFallback?<T>(
		fn: () => Promise<T>,
		fallback: () => Promise<T>,
		options?: IRetryOptions
	): Promise<T> {
		return this.execute(fn, options).catch(() => fallback());
	}
}
