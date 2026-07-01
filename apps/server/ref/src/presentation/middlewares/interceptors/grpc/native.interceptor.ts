import { type Metadata, status as GrpcStatus } from '@grpc/grpc-js';
import { Logger } from '@nestjs/common';

/**
 * Native gRPC interceptor for low-level control
 * This runs at the gRPC transport layer before NestJS processing
 */
export function createGrpcInterceptor() {
	const logger = new Logger('gRPC-Native');

	return (options: unknown, nextCall: (opts: unknown) => unknown) => {
		const call = nextCall(options) as object;
		return new Proxy(call, {
			get(target, prop) {
				if (prop === 'start') {
					return (
						metadata: Metadata,
						listener: Record<string, unknown>,
						next: (metadata: Metadata) => void
					) => {
						const startTime = Date.now();
						const opts = options as { method_definition?: { path: string } };
						const method = opts.method_definition?.path ?? 'unknown';

						logger.verbose(`[Native] ${method} started`);

						const newListener = {
							...listener,
							onReceiveMetadata: (md: Metadata, n: (metadata: Metadata) => void) => {
								logger.verbose(`[Native] ${method} received metadata`);
								const fn = listener.onReceiveMetadata as
									| ((
											metadata: Metadata,
											next: (metadata: Metadata) => void
									  ) => void)
									| undefined;
								fn?.(md, n);
							},
							onReceiveMessage: (message: unknown, n: (message: unknown) => void) => {
								logger.verbose(`[Native] ${method} received message`);
								const fn = listener.onReceiveMessage as
									| ((message: unknown, next: (message: unknown) => void) => void)
									| undefined;
								fn?.(message, n);
							},
							onReceiveStatus: (
								statusObj: { code: number; details?: string; metadata?: Metadata },
								n: (statusObj: unknown) => void
							) => {
								const duration = Date.now() - startTime;
								const statusName = GrpcStatus[statusObj.code] ?? statusObj.code;

								logger.verbose(
									`[Native] ${method} completed with status ${statusName} in ${duration}ms`
								);

								const fn = listener.onReceiveStatus as
									| ((
											statusObj: unknown,
											next: (statusObj: unknown) => void
									  ) => void)
									| undefined;
								fn?.(statusObj, n);
							},
						};

						const startFn = (target as Record<string, unknown>)['start'] as (
							metadata: Metadata,
							listener: unknown,
							next: (metadata: Metadata) => void
						) => unknown;
						return startFn(metadata, newListener, next);
					};
				}
				return (target as Record<string | symbol, unknown>)[prop as string];
			},
		});
	};
}
