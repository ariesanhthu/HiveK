import { AuthJwtRequest } from '@/application/interfaces/auth-jwt.interface';
import { ERoleType } from '@/core/enums';
import { IS_PUBLIC_KEY } from '@/presentation/decorators/public.decorator';
import { isEmpty, isFunction } from '@/shared/utils';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isEmpty(requiredRoles)) {
      return true;
    }

    let request: AuthJwtRequest | undefined;
    if (isFunction(context.getType) && context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      const gqlContext = ctx.getContext<{ req?: AuthJwtRequest; }>();
      request = gqlContext?.req;
    } else {
      request = context.switchToHttp().getRequest<AuthJwtRequest>();
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const user = request?.user;
    if (!user) {
      return false;
    }
    const roleType = (user.type || user.role) as ERoleType;
    return requiredRoles.includes(roleType) || roleType === ERoleType.ADMIN;
  }
}
