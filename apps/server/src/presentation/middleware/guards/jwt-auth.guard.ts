import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { IS_WEBHOOK_KEY } from '../../decorators/webhook.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override getRequest(context: ExecutionContext) {
    if (String(context.getType()) === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  override handleRequest(
    err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
    user: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
    info: any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
    context: ExecutionContext,
    status?: number,
  ) {
    if (user) {
      return user;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isWebhook = this.reflector.getAllAndOverride<boolean>(
      IS_WEBHOOK_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic || isWebhook) {
      return null;
    }
    throw err || new UnauthorizedException();
  }

  override canActivate(context: ExecutionContext) {
    const type = String(context.getType());
    let req: any; /* eslint-disable-line @typescript-eslint/no-explicit-any */

    if (type === 'http' && 'switchToHttp' in context) {
      req = context.switchToHttp().getRequest();
      // Bypass authentication for GraphQL playground GET requests
      if (
        req &&
        req.method === 'GET' &&
        (req.url?.includes('/graphql') || req.url?.includes('/hivek/graphql'))
      ) {
        return true;
      }
    } else if (type === ('graphql' as string)) {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext().req;
      // Bypass authentication for schema introspection queries
      if (
        req?.body?.operationName === 'IntrospectionQuery' ||
        req?.body?.query?.includes('__schema')
      ) {
        return true;
      }
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isWebhook = this.reflector.getAllAndOverride<boolean>(
      IS_WEBHOOK_KEY,
      [context.getHandler(), context.getClass()],
    );

    const hasToken = !!req?.headers?.authorization;

    if ((isPublic || isWebhook) && !hasToken) {
      return true;
    }

    return super.canActivate(context);
  }
}
