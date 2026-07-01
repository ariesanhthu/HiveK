import { SetMetadata, type Type } from '@nestjs/common';
import type { CaslAction } from '@sgod-casl/library';
import { type CaslSubjectValue } from '@/shared/permissions/casl/constants';

export const GRPC_AUTO_RESPONSE_KEY = 'GRPC_AUTO_RESPONSE_KEY';

export interface GrpcAutoResponseOptions<T extends object = object> {
	/**
	 * CASL Subject name
	 */
	subject: CaslSubjectValue;

	/**
	 * The Mapper class to use for conversion to gRPC
	 */
	mapper: Type<T>;

	/**
	 * The method name in the mapper instance to call.
	 * Compile-time check: ensures the method exists in the mapper class.
	 */
	method: keyof T & string;

	/**
	 * Optional CASL action. Defaults to 'read'.
	 */
	action?: CaslAction;
}

/**
 * Decorator to automatically apply CASL field-level filtering and gRPC mapping.
 * Works in conjunction with GrpcAutoMapInterceptor.
 */
export const GrpcAutoResponse = <T extends object>(options: GrpcAutoResponseOptions<T>) =>
	SetMetadata(GRPC_AUTO_RESPONSE_KEY, options);
