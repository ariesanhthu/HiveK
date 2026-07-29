import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import type { AuthenticatedRequest } from '@/core/types/common.type';
import { IS_WEBHOOK_KEY } from '../../decorators/webhook.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isWebhook = this.reflector.getAllAndOverride<boolean>(
      IS_WEBHOOK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isWebhook) {
      return true;
    }

    const type = context.getType();
    let request: AuthenticatedRequest;

    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      request = gqlCtx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    // Bypass API key check for GraphQL playground GET requests or Swagger docs
    if (
      request &&
      request.method === 'GET' &&
      (request.url?.includes('/graphql') ||
        request.url?.includes('/hivek/graphql') ||
        request.url?.includes('/hivek/api/docs'))
    ) {
      return true;
    }

    const apiKey = request?.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('API_KEY');

    if (!validApiKey) {
      return false;
    }
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
