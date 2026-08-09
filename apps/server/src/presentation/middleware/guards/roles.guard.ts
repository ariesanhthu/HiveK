import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ERoleType } from '@/core/enums';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '@/presentation/decorators/public.decorator';
import { isFunction, isEmpty } from '@/shared/utils';
import { IS_WEBHOOK_KEY } from '@/presentation/decorators/webhook.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isEmpty(requiredRoles)) {
      return true;
    }

    let request;
    if (String(context.getType()) === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
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
      return true;
    }

    const user = request?.user;
    if (!user) {
      return false;
    }
    return requiredRoles.includes(user.type) || user.type === ERoleType.ADMIN;
  }
}
