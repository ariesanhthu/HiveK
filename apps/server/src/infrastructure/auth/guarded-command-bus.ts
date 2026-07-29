import { Injectable, Inject } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { ModuleRef, Reflector } from '@nestjs/core';
import { REQUIRES_PERMISSION } from '@/application/decorators/requires-permission.decorator';
import {
  CONSUMES_QUOTA,
  type QuotaMeta,
} from '@/application/decorators/consumes-quota.decorator';
import {
  ENTITLEMENT_SERVICE,
  type IEntitlementService,
} from '@/application/interfaces/entitlement-service.interface';
import {
  QUOTA_ENFORCEMENT_SERVICE,
  type IQuotaEnforcementService,
} from '@/application/interfaces/quota-enforcement-service.interface';
import { RequestContextService } from '@/application/services/request-context.service';

@Injectable()
export class GuardedCommandBus extends CommandBus {
  constructor(
    moduleRef: ModuleRef,
    private readonly reflector: Reflector,
    @Inject(ENTITLEMENT_SERVICE)
    private readonly entitlementService: IEntitlementService,
    @Inject(QUOTA_ENFORCEMENT_SERVICE)
    private readonly quotaEnforcementService: IQuotaEnforcementService,
    private readonly requestContextService: RequestContextService,
  ) {
    super(moduleRef);
  }

  async execute<TInput = unknown, TResult = unknown>(
    instance: TInput,
    context?: unknown,
  ): Promise<TResult> {
    const requestContext = this.requestContextService.get();

    if (requestContext) {
      const commandClass = (instance as Record<string, unknown>).constructor;

      const requiredPermission = this.reflector.get<string>(
        REQUIRES_PERMISSION,
        commandClass,
      );

      if (requiredPermission) {
        await this.entitlementService.assert(
          requiredPermission,
          requestContext,
        );
      }

      const quotaMeta = this.reflector.get<QuotaMeta>(
        CONSUMES_QUOTA,
        commandClass,
      );

      if (quotaMeta) {
        await this.quotaEnforcementService.assertHasRoom(
          quotaMeta,
          requestContext,
        );
      }
    }

    return super.execute(instance as ICommand, context as never);
  }
}
