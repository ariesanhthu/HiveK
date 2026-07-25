import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '@/presentation/decorators/public.decorator';
import { IS_WEBHOOK_KEY } from '@/presentation/decorators/webhook.decorator';
import { isFunction } from '@/shared/utils';

@Injectable()
export class UserVerifiedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isWebhook = this.reflector.getAllAndOverride<boolean>(IS_WEBHOOK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || isWebhook) {
      return true;
    }

    let request;
    if (isFunction(context.getType) && context.getType() as string === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    const user = request?.user;
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email address is not verified');
    }

    return true;
  }
}
