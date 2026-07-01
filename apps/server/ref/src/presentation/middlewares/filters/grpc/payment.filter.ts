/**
 * gRPC exception filter for Payment domain.
 *
 * Maps Payment domain exceptions to appropriate gRPC status codes.
 */

import { Catch, Logger } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BaseGrpcExceptionFilter } from './base-grpc.filter';
import { DomainException } from '@/core';
import {
	PaymentNotFoundException,
	PaymentNotFoundForBillException,
	PaymentNotFoundForUserException,
	PaymentProviderNotFoundException,
	PaymentAttemptNotFoundException,
	PaymentAlreadyExistsException,
	PaymentAlreadyActiveForBillException,
	PaymentCapturedException,
	PaymentCancelAttemptedException,
	PaymentExpiredException,
	PaymentRefundedException,
	PaymentPartiallyRefundedException,
	PaymentCannotRetryException,
	PaymentAlreadyCompletedException,
	PaymentCannotBeRefundedException,
	PaymentNoSuccessfulAttemptException,
	PaymentInTerminalStateException,
	PaymentInvalidStateForCancelException,
	PaymentAttemptProcessingException,
	PaymentRefundAmountExceedsException,
	PaymentHasNoAttemptsException,
	PaymentFailedException,
} from '@/core';

@Catch(
	// Not found
	PaymentNotFoundException,
	PaymentNotFoundForBillException,
	PaymentNotFoundForUserException,
	PaymentProviderNotFoundException,
	PaymentAttemptNotFoundException,
	// Already exists
	PaymentAlreadyExistsException,
	PaymentAlreadyActiveForBillException,
	// State violations
	PaymentCapturedException,
	PaymentCancelAttemptedException,
	PaymentExpiredException,
	PaymentRefundedException,
	PaymentPartiallyRefundedException,
	PaymentCannotRetryException,
	PaymentAlreadyCompletedException,
	PaymentCannotBeRefundedException,
	PaymentNoSuccessfulAttemptException,
	PaymentInTerminalStateException,
	PaymentInvalidStateForCancelException,
	PaymentAttemptProcessingException,
	// Invalid input
	PaymentRefundAmountExceedsException,
	PaymentHasNoAttemptsException,
	PaymentFailedException
)
export class PaymentGrpcExceptionFilter extends BaseGrpcExceptionFilter<DomainException> {
	protected readonly logger = new Logger(PaymentGrpcExceptionFilter.name);

	protected mapToGrpcStatus(exception: DomainException): GrpcStatus {
		switch (exception.constructor) {
			// NOT_FOUND - resource doesn't exist
			case PaymentNotFoundException:
			case PaymentNotFoundForBillException:
			case PaymentNotFoundForUserException:
			case PaymentProviderNotFoundException:
			case PaymentAttemptNotFoundException:
				return GrpcStatus.NOT_FOUND;

			// ALREADY_EXISTS - duplicate/conflict
			case PaymentAlreadyExistsException:
			case PaymentAlreadyActiveForBillException:
				return GrpcStatus.ALREADY_EXISTS;

			// FAILED_PRECONDITION - operation rejected due to system state
			case PaymentCapturedException:
			case PaymentCancelAttemptedException:
			case PaymentExpiredException:
			case PaymentRefundedException:
			case PaymentPartiallyRefundedException:
			case PaymentCannotRetryException:
			case PaymentAlreadyCompletedException:
			case PaymentCannotBeRefundedException:
			case PaymentNoSuccessfulAttemptException:
			case PaymentInTerminalStateException:
			case PaymentInvalidStateForCancelException:
			case PaymentAttemptProcessingException:
				return GrpcStatus.FAILED_PRECONDITION;

			// INVALID_ARGUMENT - client sent bad data
			case PaymentRefundAmountExceedsException:
			case PaymentHasNoAttemptsException:
			case PaymentFailedException:
				return GrpcStatus.INVALID_ARGUMENT;

			default:
				return GrpcStatus.INTERNAL;
		}
	}
}
