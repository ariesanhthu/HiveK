import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { RequestContextService } from '@/application/services/request-context.service';
import type { IRequestContext } from '@/application/interfaces/request-context.interface';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly requestContextService: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    const requestContext: IRequestContext = {
      userId: user.sub,
      enterpriseId: user.enterpriseId,
      ownerId: user.ownerId,
      role: user.workspaceRole,
    };

    return from(
      this.requestContextService.run(requestContext, async () => {
        return next.handle().toPromise();
      }),
    );
  }
}
