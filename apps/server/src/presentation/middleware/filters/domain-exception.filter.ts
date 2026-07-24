import {
  BadRequestDomainException,
  ConflictDomainException,
  DomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '@/core/exceptions';
import { ApiResponseHelper } from '@/presentation/utils/api-response.helper';
import { isFunction } from '@/shared/utils';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

const ERROR_CODE_MAP: Record<string, string> = {
  NotFoundDomainException: 'NOT_FOUND',
  ConflictDomainException: 'CONFLICT',
  ForbiddenDomainException: 'FORBIDDEN',
  UnauthorizedDomainException: 'UNAUTHORIZED',
  BadRequestDomainException: 'BAD_REQUEST',
};

const STATUS_MAP: Record<string, HttpStatus> = {
  NotFoundDomainException: HttpStatus.NOT_FOUND,
  ConflictDomainException: HttpStatus.CONFLICT,
  ForbiddenDomainException: HttpStatus.FORBIDDEN,
  UnauthorizedDomainException: HttpStatus.UNAUTHORIZED,
  BadRequestDomainException: HttpStatus.BAD_REQUEST,
};

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    if (isFunction(host.getType) && host.getType<string>() === 'graphql') {
      throw exception;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionName = exception.constructor.name;
    const status = STATUS_MAP[exceptionName] ?? HttpStatus.BAD_REQUEST;
    const code = ERROR_CODE_MAP[exceptionName] ?? 'DOMAIN_ERROR';
    const errorResponse = ApiResponseHelper.error(code, exception.message);

    response.status(status).json(errorResponse);
  }
}
