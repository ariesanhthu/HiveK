import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override getRequest(context: ExecutionContext) {
    if (typeof context.getType === 'function' && context.getType() as string === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  override canActivate(context: ExecutionContext) {
    const type = typeof context.getType === 'function' ? (context.getType() as string) : 'http';
    if (type === 'http' && typeof context.switchToHttp === 'function') {
      const req = context.switchToHttp().getRequest();
      // Bypass authentication for GraphQL playground GET requests
      if (req && req.method === 'GET' && req.url?.includes('/graphql')) {
        return true;
      }
    } else if (type === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      // Bypass authentication for schema introspection queries
      if (req?.body?.operationName === 'IntrospectionQuery' || req?.body?.query?.includes('__schema')) {
        return true;
      }
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
