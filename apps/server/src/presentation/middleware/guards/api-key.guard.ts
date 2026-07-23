import { SecurityConfig } from '@/configs';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly securityConfig: SecurityConfig) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const type = context.getType() as string;
    let request: any;

    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      request = gqlCtx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    // Bypass API key check for GraphQL playground GET requests or Swagger docs
    if (
      request
      && request.method === 'GET'
      && (
        request.url?.includes('/graphql')
        || request.url?.includes('/hivek/graphql')
        || request.url?.includes('/hivek/api/docs')
      )
    ) {
      return true;
    }

    const apiKey = request?.headers['x-api-key'];
    const validApiKey = this.securityConfig.getApiKey();

    if (!validApiKey) {
      return false;
    }
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
