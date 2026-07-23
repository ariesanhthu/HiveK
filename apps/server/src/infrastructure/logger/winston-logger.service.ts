import { ILoggerService } from '@/application';
import { JsonObject } from '@/core/types/common.type';
import { env } from '@/shared/utils';
import { Injectable, Optional, Scope } from '@nestjs/common';
import { createLogger, Logger as WinstonLogger } from 'winston';
import { winstonConfig } from './winston.config';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements ILoggerService {
  private winstonLogger: WinstonLogger;
  private context?: string;

  constructor(@Optional() context?: string) {
    this.winstonLogger = createLogger(winstonConfig);
    this.context = context;
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string, metadata?: JsonObject): void {
    this.winstonLogger.info(message, { context: context || this.context, ...(metadata || {}) });
  }

  error(message: any, trace?: string, context?: string, metadata?: JsonObject): void {
    this.winstonLogger.error(message, {
      stack: trace,
      context: context || this.context,
      ...(metadata || {}),
    });
  }

  warn(message: any, context?: string, metadata?: JsonObject): void {
    this.winstonLogger.warn(message, { context: context || this.context, ...(metadata || {}) });
  }

  debug(message: any, context?: string, metadata?: JsonObject): void {
    if (env('NODE_ENV', 'development') !== 'development') return;
    this.winstonLogger.debug(message, { context: context || this.context, ...(metadata || {}) });
  }

  verbose(message: any, context?: string, metadata?: JsonObject): void {
    if (env('NODE_ENV', 'development') !== 'development') return;
    this.winstonLogger.verbose(message, { context: context || this.context, ...(metadata || {}) });
  }
}
