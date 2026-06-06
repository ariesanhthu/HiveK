import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainException, NotFoundDomainException, ConflictDomainException, ForbiddenDomainException, UnauthorizedDomainException, BadRequestDomainException } from '@/core/exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    if (typeof host.getType === 'function' && host.getType() as string === 'graphql') {
      throw exception;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;

    if (exception instanceof NotFoundDomainException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ConflictDomainException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof ForbiddenDomainException) {
      status = HttpStatus.FORBIDDEN;
    } else if (exception instanceof UnauthorizedDomainException) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof BadRequestDomainException) {
      status = HttpStatus.BAD_REQUEST;
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
      timestamp: new Date().toISOString(),
    });
  }
}
