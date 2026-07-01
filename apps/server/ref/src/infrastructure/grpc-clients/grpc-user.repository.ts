import { Injectable, Logger } from '@nestjs/common';
import { IUserRepository, ExternalUserEntity } from '@/core';
import { MyRetryService } from '../services/retry/my-retry.service';
import { MyCircuitBreakerService } from '../services/circuit-breaker/my-circuit-breaker.service';

/**
 * gRPC implementation of IUserRepository.
 * Fetches user data from external Auth service.
 *
 * TODO: Replace placeholder implementation with actual gRPC client when proto files are available.
 *
 * Required proto file: proto/external/auth.proto or proto/external/user.proto
 * Expected service: UserService or AuthService
 * Expected methods: GetById, GetByIds, Exists, GetByEmail
 */
@Injectable()
export class GrpcUserRepository implements IUserRepository {
	private readonly logger = new Logger(GrpcUserRepository.name);
	private readonly SERVICE_NAME = 'auth-service';

	constructor(
		private readonly retry: MyRetryService,
		private readonly circuitBreaker: MyCircuitBreakerService
		// TODO: Inject gRPC client when proto is available
		// @Inject('AUTH_PACKAGE') private readonly grpcClient: ClientGrpc,
	) {}

	async findById(id: string): Promise<ExternalUserEntity | null> {
		this.logger.debug(`Finding user by ID: ${id}`);

		try {
			return await this.circuitBreaker.execute(
				() =>
					this.retry.execute(() => this.fetchUserById(id), {
						maxAttempts: 3,
						shouldRetry: this.isRetryableError,
					}),
				this.SERVICE_NAME
			);
		} catch (error) {
			this.logger.warn(`Failed to fetch user ${id}: ${(error as Error).message}`);
			return null;
		}
	}

	async findByIds(ids: string[]): Promise<ExternalUserEntity[]> {
		if (!ids.length) return [];

		// Batch fetch - could be optimized with a batch gRPC call
		const results = await Promise.all(ids.map((id) => this.findById(id)));
		return results.filter((e): e is ExternalUserEntity => e !== null);
	}

	async exists(id: string): Promise<boolean> {
		const entity = await this.findById(id);
		return entity !== null;
	}

	async findByEmail(email: string): Promise<ExternalUserEntity | null> {
		this.logger.debug(`Finding user by email: ${email}`);

		try {
			return await this.circuitBreaker.execute(
				() =>
					this.retry.execute(() => this.fetchUserByEmail(email), {
						maxAttempts: 3,
						shouldRetry: this.isRetryableError,
					}),
				this.SERVICE_NAME
			);
		} catch (error) {
			this.logger.warn(`Failed to fetch user by email ${email}: ${(error as Error).message}`);
			return null;
		}
	}

	// --- Placeholder gRPC methods ---

	/**
	 * TODO: Replace with actual gRPC call when proto is available
	 */
	private async fetchUserById(id: string): Promise<ExternalUserEntity | null> {
		// TODO: Replace with actual gRPC call
		this.logger.warn(`[PLACEHOLDER] fetchUserById called with id: ${id}. Returning mock data.`);

		// Return mock data for testing - REMOVE when real gRPC is implemented
		return {
			id,
			email: `user-${id}@example.com`,
			status: 'ACTIVE',
		};
	}

	/**
	 * TODO: Replace with actual gRPC call when proto is available
	 */
	private async fetchUserByEmail(email: string): Promise<ExternalUserEntity | null> {
		// TODO: Replace with actual gRPC call
		this.logger.warn(
			`[PLACEHOLDER] fetchUserByEmail called with email: ${email}. Returning mock data.`
		);

		// Return mock data for testing - REMOVE when real gRPC is implemented
		return {
			id: `mock-user-id`,
			email,
			status: 'ACTIVE',
		};
	}

	/**
	 * Determine if error is retryable
	 */
	private isRetryableError = (error: Error): boolean => {
		const message = error.message.toLowerCase();
		return (
			message.includes('unavailable') ||
			message.includes('timeout') ||
			message.includes('deadline') ||
			message.includes('connection')
		);
	};
}
