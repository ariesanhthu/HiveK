/**
 * Base class for gRPC mappers.
 *
 * Provides common validation logic using Zod schemas.
 * All domain-specific mappers should extend this class.
 */

import { type Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import z, { type ZodType, type ZodError } from 'zod';

export abstract class BaseGrpcMapper {
	protected abstract readonly logger: Logger;

	/**
	 * Validate and parse data using a Zod schema.
	 * Throws RpcException with INVALID_ARGUMENT on validation failure.
	 */
	protected validate<T>(schema: ZodType<T>, data: unknown): T {
		const result = schema.safeParse(data);
		if (!result.success) {
			this.logger.error(this.formatZodError(result.error));
			throw new RpcException({
				code: grpc.status.INVALID_ARGUMENT,
				message: this.formatZodError(result.error),
			});
		}
		return result.data;
	}

	/**
	 * Format Zod error for logging and response.
	 * Override this method to customize error formatting.
	 */
	protected formatZodError(error: ZodError): string {
		return JSON.stringify(z.treeifyError(error));
	}
}
