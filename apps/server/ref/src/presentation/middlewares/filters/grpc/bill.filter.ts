/**
 * gRPC exception filter for Bill domain.
 *
 * Maps Bill domain exceptions to appropriate gRPC status codes.
 */

import { Catch, Logger } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BaseGrpcExceptionFilter } from './base-grpc.filter';
import { DomainException } from '@/core';
import {
	BillNotFoundException,
	BillCannotCancelException,
	BillMultiplePlanException,
	BillTaxAmountMismatchException,
	BillTotalAmountMismatchException,
	BillFinalAmountMismatchException,
	BillCreditRefundAmountMismatchException,
	BillCreditRefundAmountInvalidException,
} from '@/core';

@Catch(
	BillNotFoundException,
	BillCannotCancelException,
	BillMultiplePlanException,
	BillTaxAmountMismatchException,
	BillTotalAmountMismatchException,
	BillFinalAmountMismatchException,
	BillCreditRefundAmountMismatchException,
	BillCreditRefundAmountInvalidException
)
export class BillGrpcExceptionFilter extends BaseGrpcExceptionFilter<DomainException> {
	protected readonly logger = new Logger(BillGrpcExceptionFilter.name);

	protected mapToGrpcStatus(exception: DomainException): GrpcStatus {
		switch (exception.constructor) {
			// NOT_FOUND
			case BillNotFoundException:
				return GrpcStatus.NOT_FOUND;

			// FAILED_PRECONDITION - operation rejected due to system state
			case BillCannotCancelException:
				return GrpcStatus.FAILED_PRECONDITION;

			// INVALID_ARGUMENT - client sent bad data
			case BillMultiplePlanException:
			case BillTaxAmountMismatchException:
			case BillTotalAmountMismatchException:
			case BillFinalAmountMismatchException:
			case BillCreditRefundAmountMismatchException:
			case BillCreditRefundAmountInvalidException:
				return GrpcStatus.INVALID_ARGUMENT;

			default:
				return GrpcStatus.INTERNAL;
		}
	}
}
