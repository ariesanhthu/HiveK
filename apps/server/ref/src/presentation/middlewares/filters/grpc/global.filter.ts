/**
 * Global gRPC Exception Filter
 *
 * Catches all unhandled exceptions in gRPC controllers and converts them to RpcException.
 * CASL errors handled by {@link CaslGrpcExceptionFilter} from `@sgod-casl/library`.
 */

import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GrpcExceptionFilter.name);

	catch(exception: unknown): Observable<never> {
		if (exception instanceof RpcException) {
			return throwError(() => exception);
		}

		const error = exception instanceof Error ? exception : new Error(String(exception));
		this.logger.error(`Unhandled exception: ${error.message}`, error.stack);

		return throwError(
			() =>
				new RpcException({
					code: GrpcStatus.INTERNAL,
					message: error.message || 'Internal server error',
					details: error.constructor.name,
				})
		);
	}
}
