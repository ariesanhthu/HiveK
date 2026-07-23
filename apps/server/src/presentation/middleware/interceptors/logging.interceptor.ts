import { type ILoggerService, LOGGER_SERVICE } from '@/application/interfaces';
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface GraphQLRequest {
  body?: {
    operationName?: string;
  };
}

interface GraphQLContext {
  req?: GraphQLRequest;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType() as string;

    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<GraphQLContext>();
      const req = ctx.req;
      const operationName = req?.body?.operationName;
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
    const request = ctx.getRequest<FastifyRequest>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse<FastifyReply>();
        const statusCode = response.statusCode;
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${statusCode} - ${delay}ms`);
      }),
    );
  }
}
