import { Controller, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CaslAction, CheckPolicies } from '@sgod-casl/library';
import { GrpcAutoMapInterceptor } from '@/presentation/middlewares/interceptors';
import { GrpcAutoResponse } from '@/presentation/decorators/grpc-auto-response.decorator';
import { CaslSubject } from '@/shared/permissions/casl';
import { PaymentGrpcCaslGuard } from '@/shared/permissions/casl/payment-grpc-casl.guard';
import { PaymentGrpcMetadataExtractGuard } from '@/shared/permissions/casl/payment-grpc-metadata.guard';
import type { PaymentEventResponseDto } from '@/application/dtos';
import {
	PaymentEventGetByIdQuery,
	PaymentEventGetByPaymentIdQuery,
	PaymentEventGetByIdSchema,
	PaymentEventGetByPaymentIdSchema,
} from '@/application/queries';
import { AuditServiceControllerMethods } from '@/infrastructure/generated/grpc/payment/repositories/audit.repository';
import type {
	GetEventByIdRequest,
	GetEventsByPaymentIdRequest,
} from '@/infrastructure/generated/grpc/payment/entities/audit.entity';
import { GrpcExceptionFilter } from '@/presentation/middlewares/filters/grpc/global.filter';
import { GrpcZodValidationPipe } from '@/presentation/middlewares/pipes/grpc/zod-validation.pipe';
import type { PaginationCursorResponseDto } from '@/shared/dtos';
import { ESortOrder } from '@/shared/enums';
import { AuditGrpcMapper } from '@/presentation/mappers';

@Controller()
@UseFilters(new GrpcExceptionFilter())
@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
@UseInterceptors(GrpcAutoMapInterceptor)
@AuditServiceControllerMethods()
export class AuditController {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly mapper: AuditGrpcMapper
	) {}
	/**
	 * Get audit event by ID
	 * Permissions: ReadAuditLogs (SGOD only)
	 */
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.AuditLog))
	@GrpcAutoResponse({
		subject: CaslSubject.AuditLog,
		mapper: AuditGrpcMapper,
		method: 'toPaymentEventResponse',
	})
	@UsePipes(new GrpcZodValidationPipe(PaymentEventGetByIdSchema))
	async getEventById(request: GetEventByIdRequest): Promise<PaymentEventResponseDto> {
		return this.queryBus.execute(new PaymentEventGetByIdQuery({ id: request.id }));
	}
	/**
	 * Get audit events by payment ID
	 * Permissions: ReadAuditLogs (SGOD only)
	 */
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.AuditLog))
	@GrpcAutoResponse({
		subject: CaslSubject.AuditLog,
		mapper: AuditGrpcMapper,
		method: 'toPaymentEventListResponse',
	})
	@UsePipes(new GrpcZodValidationPipe(PaymentEventGetByPaymentIdSchema))
	async getEventsByPaymentId(
		request: GetEventsByPaymentIdRequest
	): Promise<PaginationCursorResponseDto<PaymentEventResponseDto>> {
		return this.queryBus.execute(
			new PaymentEventGetByPaymentIdQuery({
				paymentId: request.paymentId,
				limit: request.limit,
				cursor: request.cursor || null,
				sortOrder: request.sortOrder as ESortOrder,
			})
		);
	}
}
