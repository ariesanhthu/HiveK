import { Controller, UseFilters, UseGuards, UseInterceptors, Inject } from '@nestjs/common';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { PaymentGrpcExceptionFilter } from '@/presentation/middlewares/filters';
import { CaslAction, CheckPolicies } from '@sgod-casl/library';
import { GrpcAutoMapInterceptor } from '@/presentation/middlewares/interceptors';
import { GrpcAutoResponse } from '@/presentation/decorators/grpc-auto-response.decorator';
import {
	CaslSubject,
	PaymentGrpcCaslGuard,
	PaymentGrpcMetadataExtractGuard,
} from '@/shared/permissions/casl';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	OUTBOX_REPOSITORY,
	type IOutboxRepository,
} from '@/core';
import { PaymentServiceControllerMethods } from '@/infrastructure/generated/grpc/payment/repositories/payment.repository';
import {
	type PaymentCreateRequest,
	type PaymentRetryRequest,
	type PaymentHandleWebhookRequest,
	type PaymentGetByIdRequest,
	type PaymentGetListRequest,
	PaymentRetryResponse,
	PaymentCreateResponse,
} from '@/infrastructure/generated/grpc/payment/entities/payment.entity';
import { Empty } from '@/infrastructure/generated/grpc/common/common';
import {
	PaymentCreateCommand,
	PaymentRetryCommand,
	PaymentHandleWebhookCommand,
} from '@/application/commands';
import type { PaymentResponseDto } from '@/application/dtos';
import { PaymentGetByIdQuery, PaymentGetListQuery } from '@/application/queries';
import type { PaginationCursorResponseDto } from '@/shared/dtos';
import { PaymentGrpcMapper } from '@/presentation/mappers';

@Controller()
@UseFilters(new PaymentGrpcExceptionFilter())
@UseInterceptors(GrpcAutoMapInterceptor)
@PaymentServiceControllerMethods()
export class PaymentController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly mapper: PaymentGrpcMapper,
		private readonly eventBus: EventBus,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		@Inject(OUTBOX_REPOSITORY)
		private readonly outboxRepository: IOutboxRepository
	) {}

	/**
	 * Create a new payment
	 * Permissions: CreateTransaction (ENTERPRISE)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Create, CaslSubject.PaymentTransaction))
	async create(request: PaymentCreateRequest): Promise<PaymentCreateResponse> {
		const dto = this.mapper.toCreateDto(request);
		const result = await this.commandBus.execute(new PaymentCreateCommand(dto));
		return this.mapper.toCreateResponse(result);
	}

	/**
	 * Retry a failed payment
	 * Permissions: RefundTransaction (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Refund, CaslSubject.PaymentTransaction))
	async retry(request: PaymentRetryRequest): Promise<PaymentRetryResponse> {
		const dto = this.mapper.toRetryDto(request);
		const result = await this.commandBus.execute(new PaymentRetryCommand(dto));
		return this.mapper.toRetryResponse(result);
	}

	async handleWebhook(request: PaymentHandleWebhookRequest): Promise<Empty> {
		const dto = this.mapper.toHandleWebhookDto(request);
		await this.commandBus.execute(new PaymentHandleWebhookCommand(dto));
		return {};
	}

	/**
	 * Get payment by ID
	 * Permissions: ReadOwnTransactions (ENTERPRISE), ReadAllTransactions (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.PaymentTransaction))
	@GrpcAutoResponse({
		subject: CaslSubject.PaymentTransaction,
		mapper: PaymentGrpcMapper,
		method: 'toPaymentResponse',
	})
	async getById(request: PaymentGetByIdRequest): Promise<PaymentResponseDto> {
		const dto = this.mapper.toGetByIdDto(request);
		return this.queryBus.execute(new PaymentGetByIdQuery(dto));
	}

	/**
	 * Get list of payments
	 * Permissions: ReadOwnTransactions (ENTERPRISE), ReadAllTransactions (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.PaymentTransaction))
	@GrpcAutoResponse({
		subject: CaslSubject.PaymentTransaction,
		mapper: PaymentGrpcMapper,
		method: 'toPaymentListResponse',
	})
	async getList(
		request: PaymentGetListRequest
	): Promise<PaginationCursorResponseDto<PaymentResponseDto>> {
		const dto = this.mapper.toGetListDto(request);
		return this.queryBus.execute(new PaymentGetListQuery(dto));
	}

	// /**
	//  * Test endpoint - publishes PaymentCompletedEvent for testing subscription workflow
	//  * This is used to verify that the subscription update workflow is triggered correctly
	//  */
	// async testPublishPaymentCompleted(): Promise<Empty> {
	// 	const testPaymentId = 'test-payment-001';
	// 	// const testBillId = '69739766c165262329b87c19';
	// 	const testBillId = '69d3bb3b896df7106de60dd2';
	// 	const testAttemptId = 'test-attempt-001';
	// 	const testAmount = 1000000; // in cents/smallest unit
	// 	const testCurrency = 'USD';

	// 	this.logger.log(
	// 		`TestPublishPaymentCompleted: Saving PaymentCompletedEvent to Outbox for testing. ` +
	// 			`PaymentId: ${testPaymentId}, BillId: ${testBillId}`
	// 	);

	// 	// Create and save the event to outbox
	// 	await this.outboxRepository.create(
	// 		new OutboxEventEntity({
	// 			eventType: 'PaymentCompletedEvent',
	// 			payload: {
	// 				paymentId: testPaymentId,
	// 				billId: testBillId,
	// 				attemptId: testAttemptId,
	// 				amount: testAmount,
	// 				currency: testCurrency,
	// 			},
	// 			status: 'PENDING',
	// 			attempts: 0,
	// 			createdAt: new Date(),
	// 		})
	// 	);

	// 	this.logger.log(`TestPublishPaymentCompleted: Event saved to outbox successfully`);

	// 	return {};
	// }
}
