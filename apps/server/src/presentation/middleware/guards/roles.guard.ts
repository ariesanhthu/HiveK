import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ERoleType } from '@/core/enums';
import { ROLES_KEY } from '../../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ERoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    let request;
    if (typeof context.getType === 'function' && context.getType() as string === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }
    
    const user = request?.user;
    if (!user) {
      return false;
    }
    console.log('User:', user);
    // Access is allowed if the user's type matches one of the required roles,
    // or if the user is an ADMIN (who bypasses specific checks).
    return requiredRoles.includes(user.type) || user.type === ERoleType.ADMIN;
  }
}
