/**
 * gRPC exception filter for Provider domain.
 *
 * Maps Provider domain exceptions to appropriate gRPC status codes.
 */

import { Catch, Logger } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BaseGrpcExceptionFilter } from './base-grpc.filter';
import { DomainException } from '@/core';
import {
	PaymentProviderNotFoundException,
	PaymentProviderAlreadyExistsException,
	InvalidProviderCredentialsException,
	PaymentProviderDisabledException,
} from '@/core';

@Catch(
	// Not found
	PaymentProviderNotFoundException,
	// Already exists
	PaymentProviderAlreadyExistsException,
	// Invalid argument
	InvalidProviderCredentialsException,
	// Failed precondition
	PaymentProviderDisabledException
)
export class PaymentProviderGrpcExceptionFilter extends BaseGrpcExceptionFilter<DomainException> {
	protected readonly logger = new Logger(PaymentProviderGrpcExceptionFilter.name);

	protected mapToGrpcStatus(exception: DomainException): GrpcStatus {
		switch (exception.constructor) {
			// NOT_FOUND - resource doesn't exist
			case PaymentProviderNotFoundException:
				return GrpcStatus.NOT_FOUND;

			// ALREADY_EXISTS - duplicate/conflict
			case PaymentProviderAlreadyExistsException:
				return GrpcStatus.ALREADY_EXISTS;

			// INVALID_ARGUMENT - client sent bad data
			case InvalidProviderCredentialsException:
				return GrpcStatus.INVALID_ARGUMENT;

			// FAILED_PRECONDITION - operation rejected due to system state
			case PaymentProviderDisabledException:
				return GrpcStatus.FAILED_PRECONDITION;

			default:
				return GrpcStatus.UNKNOWN;
		}
	}
}
