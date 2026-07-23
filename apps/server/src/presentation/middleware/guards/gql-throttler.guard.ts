import { isFunction } from '@/shared/utils';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  override getRequestResponse(context: ExecutionContext) {
    if (isFunction(context.getType) && context.getType() as string === 'graphql') {
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
    const type = isFunction(context.getType) ? (context.getType() as string) : 'http';
    if (type === 'http' && isFunction(context.switchToHttp)) {
      const req = context.switchToHttp().getRequest();
      // Bypass rate limiting for GraphQL playground GET requests
      if (
        req && req.method === 'GET'
        && (req.url?.includes('/graphql') || req.url?.includes('/hivek/graphql'))
      ) {
        return true;
      }
    }
    return super.canActivate(context);
  }
}
