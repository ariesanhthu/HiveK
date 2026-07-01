/**
 * Base class for domain-specific gRPC exception filters.
 *
 * Provides a consistent pattern for mapping domain exceptions to gRPC status codes.
 * Domain filters should extend this class and implement the mapping logic.
 */

import { type ExceptionFilter, type Logger } from '@nestjs/common';
import { type Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { type DomainException } from '@/core';

export interface GrpcErrorDetails {
	code: GrpcStatus;
	message: string;
	details?: string;
}

export abstract class BaseGrpcExceptionFilter<
	T extends DomainException,
> implements ExceptionFilter {
	protected abstract readonly logger: Logger;

	/**
	 * Map exception to gRPC status code.
	 * Override this method in domain filters to define exception → status mapping.
	 */
	protected abstract mapToGrpcStatus(exception: T): GrpcStatus;

	catch(exception: T): Observable<never> {
		const grpcStatus = this.mapToGrpcStatus(exception);

		this.logger.warn(
			`${exception.constructor.name}: ${exception.message} → gRPC ${GrpcStatus[grpcStatus]}`
		);

		const error: GrpcErrorDetails = {
			code: grpcStatus,
			message: exception.message,
			details: exception.constructor.name,
		};

		return throwError(() => new RpcException(error));
	}
}
