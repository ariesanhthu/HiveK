import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  override getRequestResponse(context: ExecutionContext) {
    if (typeof context.getType === 'function' && context.getType() as string === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      // Ensure req and res are present (populated via context option in GraphQLModule)
      return { req: ctx?.req || {}, res: ctx?.res };
    }
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest();
    const res = httpCtx.getResponse();
    return { req, res };
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = typeof context.getType === 'function' ? (context.getType() as string) : 'http';
    if (type === 'http' && typeof context.switchToHttp === 'function') {
      const req = context.switchToHttp().getRequest();
      // Bypass rate limiting for GraphQL playground GET requests
      if (req && req.method === 'GET' && (req.url?.includes('/graphql') || req.url?.includes('/hivek/graphql'))) {
        return true;
      }
    }
    return super.canActivate(context);
  }
}
