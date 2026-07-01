import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ZodError, ZodType } from 'zod';

@Injectable()
export class GrpcZodValidationPipe implements PipeTransform {
	constructor(private schema: ZodType) {}
	transform(value: unknown, _metadata: ArgumentMetadata) {
		if (!value) {
			return value;
		}
		// Skip validation for gRPC Metadata and Call objects (duck-typed; not message bodies)
		if (typeof value === 'object' && value !== null) {
			const o = value as Record<string, unknown>;
			if ('internalRepr' in o || typeof o.call === 'function' || typeof o.code === 'number') {
				return value;
			}
		}

		try {
			return this.schema.parse(value);
		} catch (error: unknown) {
			const details =
				error instanceof ZodError
					? error.issues
					: error instanceof Error
						? error.message
						: String(error);
			throw new RpcException({
				code: status.INVALID_ARGUMENT,
				message: 'Validation failed',
				details,
			});
		}
	}
}
