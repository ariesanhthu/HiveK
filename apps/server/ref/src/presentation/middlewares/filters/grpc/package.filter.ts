/**
 * gRPC exception filter for Package domain.
 *
 * Maps Package domain exceptions to appropriate gRPC status codes.
 */

import { Catch, Logger } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BaseGrpcExceptionFilter } from './base-grpc.filter';
import { DomainException } from '@/core';
import {
	PackageNotFoundException,
	PackageCodeAlreadyExistsException,
	PackageDeactivationNotAllowedException,
	PackageHasActiveVersionException,
	PackageInUseException,
	PackageNoVariantsException,
	DuplicateVariantException,
	InvalidFeaturePermissionException,
} from '@/core';

@Catch(
	PackageNotFoundException,
	PackageCodeAlreadyExistsException,
	PackageDeactivationNotAllowedException,
	PackageHasActiveVersionException,
	PackageInUseException,
	PackageNoVariantsException,
	DuplicateVariantException,
	InvalidFeaturePermissionException
)
export class PackageGrpcExceptionFilter extends BaseGrpcExceptionFilter<DomainException> {
	protected readonly logger = new Logger(PackageGrpcExceptionFilter.name);

	protected mapToGrpcStatus(exception: DomainException): GrpcStatus {
		switch (exception.constructor) {
			// NOT_FOUND
			case PackageNotFoundException:
				return GrpcStatus.NOT_FOUND;

			// ALREADY_EXISTS
			case PackageCodeAlreadyExistsException:
			case DuplicateVariantException:
				return GrpcStatus.ALREADY_EXISTS;

			// FAILED_PRECONDITION - operation rejected due to system state
			case PackageDeactivationNotAllowedException:
			case PackageHasActiveVersionException:
			case PackageInUseException:
				return GrpcStatus.FAILED_PRECONDITION;

			// INVALID_ARGUMENT - client sent bad data
			case PackageNoVariantsException:
			case InvalidFeaturePermissionException:
				return GrpcStatus.INVALID_ARGUMENT;

			default:
				return GrpcStatus.INTERNAL;
		}
	}
}
