import { Injectable, Logger } from '@nestjs/common';
import { IEnterpriseRepository, ExternalEnterpriseEntity } from '@/core';
import { MyRetryService } from '../services/retry/my-retry.service';
import { MyCircuitBreakerService } from '../services/circuit-breaker/my-circuit-breaker.service';

/**
 * gRPC implementation of IEnterpriseRepository.
 * Fetches enterprise data from external Enterprise/Auth service.
 *
 * TODO: Replace placeholder implementation with actual gRPC client when proto files are available.
 *
 * Required proto file: proto/external/enterprise.proto
 * Expected service: EnterpriseService
 * Expected methods: GetById, GetByIds, Exists
 */
@Injectable()
export class GrpcEnterpriseRepository implements IEnterpriseRepository {
	private readonly logger = new Logger(GrpcEnterpriseRepository.name);
	private readonly SERVICE_NAME = 'enterprise-service';

	constructor(
		private readonly retry: MyRetryService,
		private readonly circuitBreaker: MyCircuitBreakerService
		// TODO: Inject gRPC client when proto is available
		// @Inject('ENTERPRISE_PACKAGE') private readonly grpcClient: ClientGrpc,
	) {}

	async findById(id: string): Promise<ExternalEnterpriseEntity | null> {
		this.logger.debug(`Finding enterprise by ID: ${id}`);

		try {
			return await this.circuitBreaker.execute(
				() =>
					this.retry.execute(() => this.fetchEnterpriseById(id), {
						maxAttempts: 3,
						shouldRetry: this.isRetryableError,
					}),
				this.SERVICE_NAME
			);
		} catch (error) {
			this.logger.warn(`Failed to fetch enterprise ${id}: ${(error as Error).message}`);
			return null;
		}
	}

	async findByIds(ids: string[]): Promise<ExternalEnterpriseEntity[]> {
		if (!ids.length) return [];

		// Batch fetch - could be optimized with a batch gRPC call
		const results = await Promise.all(ids.map((id) => this.findById(id)));
		return results.filter((e): e is ExternalEnterpriseEntity => e !== null);
	}

	async exists(id: string): Promise<boolean> {
		const entity = await this.findById(id);
		return entity !== null;
	}

	// --- Placeholder gRPC methods ---

	/**
	 * TODO: Replace with actual gRPC call when proto is available
	 *
	 * Expected implementation:
	 * ```typescript
	 * private async fetchEnterpriseById(id: string): Promise<ExternalEnterpriseEntity | null> {
	 *   const response = await firstValueFrom(
	 *     this.enterpriseClient.getById({ id })
	 *   );
	 *   return this.toEntity(response);
	 * }
	 * ```
	 */
	private async fetchEnterpriseById(id: string): Promise<ExternalEnterpriseEntity | null> {
		// TODO: Replace with actual gRPC call
		this.logger.warn(
			`[PLACEHOLDER] fetchEnterpriseById called with id: ${id}. Returning mock data.`
		);

		// Return mock data for testing - REMOVE when real gRPC is implemented
		return {
			id,
			name: `Mock Enterprise ${id}`,
			status: 'ACTIVE',
		};
	}

	/**
	 * Determine if error is retryable (e.g., network timeout, unavailable)
	 */
	private isRetryableError = (error: Error): boolean => {
		const message = error.message.toLowerCase();
		// Retry on network/temporary errors, don't retry on NOT_FOUND or INVALID_ARGUMENT
		return (
			message.includes('unavailable') ||
			message.includes('timeout') ||
			message.includes('deadline') ||
			message.includes('connection')
		);
	};

	// --- Entity mapping (for when real gRPC is implemented) ---

	// private toEntity(proto: unknown): ExternalEnterpriseEntity {
	//   return {
	//     id: proto.id,
	//     name: proto.name,
	//     status: proto.status,
	//   };
	// }
}
