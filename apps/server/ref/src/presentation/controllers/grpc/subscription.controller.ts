import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcExceptionFilter } from '@/presentation/middlewares/filters/grpc/global.filter';
import { CaslAction, CheckPolicies } from '@sgod-casl/library';
import { GrpcAutoMapInterceptor } from '@/presentation/middlewares/interceptors';
import { GrpcAutoResponse } from '@/presentation/decorators/grpc-auto-response.decorator';
import {
	CaslSubject,
	PaymentGrpcCaslGuard,
	PaymentGrpcMetadataExtractGuard,
} from '@/shared/permissions/casl';
import { SubscriptionServiceControllerMethods } from '@/infrastructure/generated/grpc/payment/repositories/subscription.repository';
import type {
	SubscriptionGetByIdRequest,
	SubscriptionGetByEnterpriseRequest,
	SubscriptionGetListRequest,
	SubscriptionGetHistoryByIdRequest,
	SubscriptionGetListHistoryRequest,
} from '@/infrastructure/generated/grpc/payment/entities/subscription.entity';
import type { SubscriptionResponseDTO, SubscriptionHistoryResponseDTO } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';
import {
	SubscriptionGetByIdQuery,
	SubscriptionGetByEnterpriseQuery,
	SubscriptionGetListQuery,
	SubscriptionGetHistoryByIdQuery,
	SubscriptionGetListHistoryQuery,
} from '@/application/queries';
import { SubscriptionGrpcMapper } from '@/presentation/mappers';

@Controller()
@UseFilters(new GrpcExceptionFilter())
@UseInterceptors(GrpcAutoMapInterceptor)
@SubscriptionServiceControllerMethods()
export class SubscriptionController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly mapper: SubscriptionGrpcMapper
	) {}
	/**
	 * Get subscription by ID
	 * Permissions: ReadOwnSubscriptions (ENTERPRISE), ReadAllSubscriptions (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Subscription))
	@GrpcAutoResponse({
		subject: CaslSubject.Subscription,
		mapper: SubscriptionGrpcMapper,
		method: 'toSubscriptionResponse',
	})
	async getById(request: SubscriptionGetByIdRequest): Promise<SubscriptionResponseDTO> {
		const dto = this.mapper.toGetByIdDto(request);
		return this.queryBus.execute(new SubscriptionGetByIdQuery(dto));
	}

	/**
	 * Get subscription by enterprise
	 * Permissions: ReadOwnSubscriptions (ENTERPRISE), ReadAllSubscriptions (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Subscription))
	@GrpcAutoResponse({
		subject: CaslSubject.Subscription,
		mapper: SubscriptionGrpcMapper,
		method: 'toSubscriptionResponse',
	})
	async getByEnterprise(
		request: SubscriptionGetByEnterpriseRequest
	): Promise<SubscriptionResponseDTO> {
		const dto = this.mapper.toGetByEnterpriseDto(request);
		return this.queryBus.execute(new SubscriptionGetByEnterpriseQuery(dto));
	}

	/**
	 * Get list of subscriptions
	 * Permissions: ReadOwnSubscriptions (ENTERPRISE), ReadAllSubscriptions (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Subscription))
	@GrpcAutoResponse({
		subject: CaslSubject.Subscription,
		mapper: SubscriptionGrpcMapper,
		method: 'toSubscriptionListResponse',
	})
	async getList(
		request: SubscriptionGetListRequest
	): Promise<PaginationCursorResponseDto<SubscriptionResponseDTO>> {
		const dto = this.mapper.toGetListDto(request);
		return this.queryBus.execute(new SubscriptionGetListQuery(dto));
	}

	/**
	 * Get subscription history by ID
	 * Permissions: ReadOwnSubscriptions (ENTERPRISE), ReadAllSubscriptions (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.SubscriptionHistory))
	@GrpcAutoResponse({
		subject: CaslSubject.SubscriptionHistory,
		mapper: SubscriptionGrpcMapper,
		method: 'toSubscriptionHistoryItemProto',
	})
	async getHistoryById(
		request: SubscriptionGetHistoryByIdRequest
	): Promise<SubscriptionHistoryResponseDTO> {
		const dto = this.mapper.toGetHistoryByIdDto(request);
		return this.queryBus.execute(new SubscriptionGetHistoryByIdQuery(dto));
	}

	/**
	 * Get list of subscription history
	 * Permissions: ReadOwnSubscriptions (ENTERPRISE), ReadAllSubscriptions (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.SubscriptionHistory))
	@GrpcAutoResponse({
		subject: CaslSubject.SubscriptionHistory,
		mapper: SubscriptionGrpcMapper,
		method: 'toSubscriptionHistoryResponse',
	})
	async getListHistory(
		request: SubscriptionGetListHistoryRequest
	): Promise<PaginationCursorResponseDto<SubscriptionHistoryResponseDTO>> {
		const dto = this.mapper.toGetListHistoryDto(request);
		return this.queryBus.execute(new SubscriptionGetListHistoryQuery(dto));
	}
}
