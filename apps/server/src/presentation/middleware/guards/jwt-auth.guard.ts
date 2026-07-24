import { isFunction } from '@/shared/utils';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override getRequest(context: ExecutionContext) {
    if (isFunction(context.getType) && context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  override handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    if (user) {
      return user;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return null;
    }
    throw err || new UnauthorizedException();
  }

  override canActivate(context: ExecutionContext) {
    const type = isFunction(context.getType) ? context.getType() : 'http';
    let req: any;

    if (type === 'http' && isFunction(context.switchToHttp)) {
      req = context.switchToHttp().getRequest();
      // Bypass authentication for GraphQL playground GET requests
      if (
        req
        && req.method === 'GET'
        && (req.url?.includes('/graphql') || req.url?.includes('/hivek/graphql'))
      ) {
        return true;
      }
    } else if ((type as string) === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext().req;
      // Bypass authentication for schema introspection queries
      if (
        req?.body?.operationName === 'IntrospectionQuery'
        || req?.body?.query?.includes('__schema')
      ) {
        return true;
      }
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const hasToken = !!req?.headers?.authorization;

    if (isPublic && !hasToken) {
      return true;
    }

    return super.canActivate(context);
  }
}
