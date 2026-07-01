import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { getErrorMessage } from '@/shared/utils/error.util';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger('gRPC');

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		if (context.getType() !== 'rpc') {
			return next.handle();
		}

		const rpcContext = context.switchToRpc();
		const handler = context.getHandler();
		const className = context.getClass().name;
		const methodName = handler.name;
		const data: unknown = rpcContext.getData();

		const startTime = Date.now();

		this.logger.debug(
			`[${className}.${methodName}] Request started | Data: ${JSON.stringify(data).substring(0, 100)}`
		);

		return next.handle().pipe(
			tap({
				next: (response) => {
					const responseTime = Date.now() - startTime;
					this.logger.debug(
						`[${className}.${methodName}] Completed in ${responseTime}ms | Response: ${JSON.stringify(response).substring(0, 100)}`
					);
				},
				error: (error: unknown) => {
					const responseTime = Date.now() - startTime;
					this.logger.error(
						`[${className}.${methodName}] Failed in ${responseTime}ms | Error: ${getErrorMessage(error)}`
					);
				},
			})
		);
	}
}
