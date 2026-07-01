import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { IAuthService, PermissionsResponseDto, PermissionDto } from '@/core';
import { MyRetryService } from '../services/retry/my-retry.service';
import { MyCircuitBreakerService } from '../services/circuit-breaker/my-circuit-breaker.service';
import { ConfigService } from '@nestjs/config';
import { Metadata } from '@grpc/grpc-js';
import { toError } from '@/shared/utils/error.util';

export const AUTH_PACKAGE = 'AUTH_PACKAGE';

interface GetPermissionsRequest {
	userType?: string;
}

interface Permission {
	id: string;
	name: string;
	description: string;
	category: string;
	action: string;
	subject: string;
}

interface PermissionsServiceResponse {
	permissions: Permission[];
	total: number;
}

interface PermissionsGrpcService {
	GetAllPermissions(
		request: GetPermissionsRequest,
		metadata?: Metadata
	): Observable<PermissionsServiceResponse>;
}

/**
 * gRPC implementation of IAuthService.
 * Fetches permissions from external auth service via PermissionsService.
 */
@Injectable()
export class GrpcAuthService implements IAuthService, OnModuleInit {
	private readonly logger = new Logger(GrpcAuthService.name);
	private readonly SERVICE_NAME = 'auth-service';
	private permissionsGrpcService?: PermissionsGrpcService;

	constructor(
		private readonly retry: MyRetryService,
		private readonly circuitBreaker: MyCircuitBreakerService,
		private readonly configService: ConfigService,
		@Optional()
		@Inject(AUTH_PACKAGE)
		private readonly grpcClient?: ClientGrpc
	) {}

	onModuleInit(): void {
		if (this.grpcClient) {
			this.permissionsGrpcService =
				this.grpcClient.getService<PermissionsGrpcService>('PermissionsService');
			this.logger.log('PermissionsService gRPC client bound successfully');
		} else {
			this.logger.warn(
				`[PLACEHOLDER] No ${AUTH_PACKAGE} gRPC client registered. Permissions fetch will fail.`
			);
		}
	}

	async fetchPermissions(userType?: string): Promise<PermissionsResponseDto> {
		// if (!userType) {
		// 	throw new Error('userType is required');
		// }

		try {
			return await this.circuitBreaker.execute(
				() =>
					this.retry.execute(() => this.fetchPermissionsGrpc(userType), {
						maxAttempts: 3,
						shouldRetry: this.isRetryableError,
					}),
				this.SERVICE_NAME
			);
		} catch (error) {
			this.logger.error(
				`fetchPermissions failed for userType ${userType}: ${(error as Error).message}`
			);
			throw toError(error);
		}
	}

	private async fetchPermissionsGrpc(userType?: string): Promise<PermissionsResponseDto> {
		if (!this.permissionsGrpcService) {
			const error = new Error('PermissionsService gRPC client not initialized');
			this.logger.error(error.message);
			throw toError(error);
		}

		this.logger.debug(`Fetching permissions for userType: ${userType}`);

		const response = await firstValueFrom(
			this.permissionsGrpcService.GetAllPermissions({ userType })
		);

		const mappedPermissions: PermissionDto[] = response.permissions.map((p: Permission) => ({
			id: p.id,
			name: p.name,
			description: p.description,
			category: p.category,
			action: p.action,
			subject: p.subject,
		}));

		return {
			permissions: mappedPermissions,
			total: response.total,
		};
	}

	private isRetryableError = (error: Error): boolean => {
		// Only retry on transient errors
		const errorMessage = error.message.toLowerCase();
		return (
			errorMessage.includes('unavailable') ||
			errorMessage.includes('deadline exceeded') ||
			errorMessage.includes('resource exhausted')
		);
	};
}
