import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import {
	GRPC_AUTO_RESPONSE_KEY,
	GrpcAutoResponseOptions,
} from '@/presentation/decorators/grpc-auto-response.decorator';
import { CaslAction } from '@sgod-casl/library';
import { readCurrentAbility } from '@/shared/permissions/casl/ability-context';
import { filterPermittedFields } from '@/shared/permissions/casl/utils';
import { getErrorMessage, getErrorStack, toError } from '@/shared/utils/error.util';
import { PaginationCursorResponseDto } from '@/shared/dtos';

type MapperCallable = (...args: unknown[]) => unknown;

/**
 * Interceptor that automatically applies CASL field-level filtering
 * and maps the result using a specified Mapper service.
 *
 * It detects pagination patterns (items + nextCursor) automatically.
 */
@Injectable()
export class GrpcAutoMapInterceptor implements NestInterceptor {
	private readonly logger = new Logger(GrpcAutoMapInterceptor.name);

	constructor(
		private readonly reflector: Reflector,
		private readonly moduleRef: ModuleRef
	) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const options = this.reflector.get<GrpcAutoResponseOptions>(
			GRPC_AUTO_RESPONSE_KEY,
			context.getHandler()
		);

		if (!options) {
			return next.handle();
		}

		return next
			.handle()
			.pipe(mergeMap((data: unknown) => from(this.processResponse(options, data))));
	}

	private async processResponse<T extends object>(
		options: GrpcAutoResponseOptions<T>,
		data: unknown
	): Promise<unknown> {
		try {
			const ability = readCurrentAbility();

			// Resolve Mapper instance
			const mapper = this.moduleRef.get<T>(options.mapper, { strict: false });
			if (!mapper) {
				this.logger.error(`Mapper ${options.mapper.name} not found in module context.`);
				return data;
			}

			if (!ability) {
				return this.applyMapping(mapper, options, data);
			}

			const action = options.action ?? CaslAction.Read;

			// Handle Pagination Pattern
			if (this.isPaginationData(data)) {
				const filteredItems = filterPermittedFields(
					ability,
					action,
					options.subject,
					data.items
				);
				return this.invokeMapper(mapper, options.method, filteredItems, data.nextCursor);
			}

			// Handle Single Object
			const filteredData = filterPermittedFields(ability, action, options.subject, data);
			return this.invokeMapper(mapper, options.method, filteredData);
		} catch (error: unknown) {
			this.logger.error(
				`Error in GrpcAutoMapInterceptor: ${getErrorMessage(error)}`,
				getErrorStack(error)
			);
			throw toError(error);
		}
	}

	private isPaginationData(data: unknown): data is PaginationCursorResponseDto {
		if (data === null || typeof data !== 'object') {
			return false;
		}
		if (!('items' in data) || !('nextCursor' in data)) {
			return false;
		}
		const page = data as PaginationCursorResponseDto;
		return Array.isArray(page.items);
	}

	private invokeMapper(mapper: object, method: string, ...args: unknown[]): unknown {
		const fn = (mapper as Record<string, unknown>)[method];
		if (typeof fn !== 'function') {
			throw new Error(`Mapper method "${method}" is not callable`);
		}
		return fn.apply(mapper, args);
	}

	private applyMapping<T extends object>(
		mapper: T,
		options: GrpcAutoResponseOptions<T>,
		data: unknown
	): unknown {
		if (this.isPaginationData(data)) {
			return this.invokeMapper(mapper, options.method, data.items, data.nextCursor);
		}
		return this.invokeMapper(mapper, options.method, data);
	}
}
