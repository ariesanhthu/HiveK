import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType() as string;
    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      const { req, res } = ctx;
      const { operationName } = req.body;
      const now = Date.now();

      return next.handle().pipe(
        tap(() => {
          const delay = Date.now() - now;
          const queryName = operationName || 'Query';
          this.logger.log(`${queryName} (GraphQL) - ${delay}ms`);
        }),
      );
    }
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse();
        const statusCode = response.statusCode;
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${statusCode} - ${delay}ms`);
      }),
    );
  }
}
