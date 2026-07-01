import type { JsonRecord } from '@/shared/types';

export interface ILoggerService {
	setContext(context: string): void;
	log(message: string, context?: string, metadata?: JsonRecord): void;
	error(message: string, trace?: string, context?: string, metadata?: JsonRecord): void;
	warn(message: string, context?: string, metadata?: JsonRecord): void;
	debug(message: string, context?: string, metadata?: JsonRecord): void;
	verbose(message: string, context?: string, metadata?: JsonRecord): void;
}

export const LOGGER_SERVICE = Symbol('ILoggerService');
