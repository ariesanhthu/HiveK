import { type ILoggerService, LOGGER_SERVICE } from '@/application';
import {
  BadRequestDomainException,
  ConflictDomainException,
  DomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '@/core/exceptions';
import { ApiResponseHelper } from '@/presentation/utils/api-response.helper';
import { isFunction, isObject, isString } from '@/shared/utils';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

type ErrorDetail = { field?: string; message: string; };

interface ValidationErrorItem {
  property?: string;
  field?: string;
  path?: string;
  constraints?: Record<string, string>;
  message?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (isFunction(host.getType) && host.getType<string>() === 'graphql') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const reqMethod = request?.method || 'UNKNOWN';
    const reqUrl = request?.url || '';

    // ---------- DOMAIN EXCEPTIONS (checked first) ----------
    if (exception instanceof DomainException) {
      const { status, code } = this.mapDomainException(exception);
      const body = ApiResponseHelper.error(code, exception.message);
      this.logger.warn(
        `${reqMethod} ${reqUrl} ${status} - ${code}: ${exception.message}`,
      );
      return response.status(status).send(body);
    }

    // ---------- HTTP EXCEPTIONS (NestJS built-in) ----------
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const rawMessage = isString(res)
        ? res
        : (isObject(res) && 'message' in res ? res.message : undefined)
          || exception.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(',')
        : String(rawMessage);
      const code = this.httpStatusToCode(status);
      const details = this.extractDetails(res);
      const body = ApiResponseHelper.error(code, message, details);

      if (status >= 500) {
        this.logger.error(
          `${reqMethod} ${reqUrl} ${status} - ${exception.message}`,
          exception.stack,
        );
      } else {
        this.logger.warn(
          `${reqMethod} ${reqUrl} ${status} - ${code}: ${message}`,
        );
      }
      return response.status(status).send(body);
    }

    // ---------- UNHANDLED ERRORS ----------
    const errObj = exception as Error | undefined;
    const message = errObj?.message || 'Internal server error';
    this.logger.error(`${reqMethod} ${reqUrl} 500 - ${message}`, errObj?.stack);
    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(ApiResponseHelper.error('INTERNAL_ERROR', message));
  }

  private mapDomainException(exception: DomainException): {
    status: HttpStatus;
    code: string;
  } {
    if (exception instanceof NotFoundDomainException) {
      return { status: HttpStatus.NOT_FOUND, code: 'NOT_FOUND' };
    }
    if (exception instanceof ConflictDomainException) {
      return { status: HttpStatus.CONFLICT, code: 'CONFLICT' };
    }
    if (exception instanceof ForbiddenDomainException) {
      return { status: HttpStatus.FORBIDDEN, code: 'FORBIDDEN' };
    }
    if (exception instanceof UnauthorizedDomainException) {
      return { status: HttpStatus.UNAUTHORIZED, code: 'UNAUTHORIZED' };
    }
    if (exception instanceof BadRequestDomainException) {
      return { status: HttpStatus.BAD_REQUEST, code: 'BAD_REQUEST' };
    }
    return { status: HttpStatus.BAD_REQUEST, code: 'DOMAIN_ERROR' };
  }

  private httpStatusToCode(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
      [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP_VERSION_NOT_SUPPORTED',
    };
    return map[status] || 'INTERNAL_ERROR';
  }

  private extractDetails(res: string | object): ErrorDetail[] | undefined {
    if (!isObject(res)) return undefined;
    const body = res;

    if (Array.isArray(body.errors)) {
      return (body.errors as (string | ValidationErrorItem)[]).map((e) => {
        if (isString(e)) {
          return { message: e };
        }
        return {
          field: e.property || e.field || e.path,
          message: e.constraints
            ? Object.values(e.constraints).join('; ')
            : e.message || 'Validation error',
        };
      });
    }
    if (Array.isArray(body.message)) {
      return (body.message as string[]).map((msg) => ({
        message: String(msg),
      }));
    }
    return undefined;
  }
}
