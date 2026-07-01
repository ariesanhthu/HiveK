import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CaslAction, CheckPolicies } from '@sgod-casl/library';
import { GrpcAutoMapInterceptor } from '@/presentation/middlewares/interceptors';
import { GrpcAutoResponse } from '@/presentation/decorators/grpc-auto-response.decorator';
import { CaslSubject } from '@/shared/permissions/casl';
import { PaymentGrpcCaslGuard } from '@/shared/permissions/casl/payment-grpc-casl.guard';
import { PaymentGrpcMetadataExtractGuard } from '@/shared/permissions/casl/payment-grpc-metadata.guard';
import { Public } from '@/presentation/decorators/public.decorator';
import {
	PaymentProviderCreateCommand,
	PaymentProviderUpdateCommand,
	PaymentProviderDeleteCommand,
} from '@/application/commands';
import {
	PaymentProviderGetByIdQuery,
	GetPaymentProviderCredentialFieldsQuery,
} from '@/application/queries';
import type { PaymentProviderResponseDto } from '@/application/dtos';
import { PaymentProviderGetListQuery } from '@/application/queries/payment-provider-get-list/payment-provider-get-list.query';
import type { PaginationCursorResponseDto } from '@/shared/dtos';
import { PaymentProviderServiceControllerMethods } from '@/infrastructure/generated/grpc/payment/repositories/payment-provider.repository';
import type {
	PaymentProviderCreateRequest,
	PaymentProviderUpdateRequest,
	PaymentProviderDeleteRequest,
	PaymentProviderGetListRequest,
	PaymentProviderGetByIdRequest,
	GetCredentialFieldsRequest,
} from '@/infrastructure/generated/grpc/payment/entities/payment-provider.entity';
import { PaymentProviderGrpcExceptionFilter } from '@/presentation/middlewares/filters';
import { PaymentProviderGrpcMapper } from '@/presentation/mappers';

@Controller()
@UseFilters(PaymentProviderGrpcExceptionFilter)
@UseInterceptors(GrpcAutoMapInterceptor)
@PaymentProviderServiceControllerMethods()
export class PaymentProviderGrpcController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly mapper: PaymentProviderGrpcMapper
	) {}

	/**
	 * Create a new payment provider
	 *
	 * Permissions:
	 * - SGOD: CreatePaymentProvider (SGODAdmin only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Create, CaslSubject.PaymentProvider))
	async create(request: PaymentProviderCreateRequest) {
		const dto = this.mapper.toCreateDto(request);
		const result = await this.commandBus.execute(new PaymentProviderCreateCommand(dto));
		return this.mapper.toProviderResponse(result);
	}

	/**
	 * Update an existing payment provider
	 *
	 * Permissions:
	 * - SGOD: UpdatePaymentProvider (SGODAdmin only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Update, CaslSubject.PaymentProvider))
	async update(request: PaymentProviderUpdateRequest) {
		const dto = this.mapper.toUpdateDto(request);
		const result = await this.commandBus.execute(new PaymentProviderUpdateCommand(dto));
		return this.mapper.toProviderResponse(result);
	}

	/**
	 * Delete a payment provider
	 *
	 * Permissions:
	 * - SGOD: DeletePaymentProvider (SGODAdmin only)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Delete, CaslSubject.PaymentProvider))
	async delete(request: PaymentProviderDeleteRequest) {
		const dto = this.mapper.toDeleteDto(request);
		const result = await this.commandBus.execute(new PaymentProviderDeleteCommand(dto));
		return this.mapper.toProviderDeleteResponse(result);
	}

	/**
	 * Get list of payment providers
	 *
	 * Permissions:
	 * - SGOD: ReadPaymentProvider (SGODAdmin and SGODUser)
	 */
	@Public()
	@UseGuards(PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.PaymentProvider))
	@GrpcAutoResponse({
		subject: CaslSubject.PaymentProvider,
		mapper: PaymentProviderGrpcMapper,
		method: 'toProviderListResponse',
	})
	async getList(
		request: PaymentProviderGetListRequest
	): Promise<PaginationCursorResponseDto<PaymentProviderResponseDto>> {
		const dto = this.mapper.toGetListDto(request);
		const query = new PaymentProviderGetListQuery(dto);
		return this.queryBus.execute(query);
	}

	/**
	 * Get payment provider by ID
	 *
	 * Permissions:
	 * - SGOD: ReadPaymentProvider (SGODAdmin and SGODUser)
	 */
	@Public()
	@UseGuards(PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.PaymentProvider))
	@GrpcAutoResponse({
		subject: CaslSubject.PaymentProvider,
		mapper: PaymentProviderGrpcMapper,
		method: 'toProviderResponse',
	})
	async getById(request: PaymentProviderGetByIdRequest): Promise<PaymentProviderResponseDto> {
		const dto = this.mapper.toGetByIdDto(request);
		return this.queryBus.execute(new PaymentProviderGetByIdQuery(dto));
	}

	/**
	 * Get credential fields for a payment provider
	 *
	 * Permissions:
	 * - SGOD: ReadPaymentProvider (SGODAdmin and SGODUser)
	 */
	@Public()
	@UseGuards(PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.PaymentProvider))
	async getCredentialFields(request: GetCredentialFieldsRequest) {
		const fields = await this.queryBus.execute(
			new GetPaymentProviderCredentialFieldsQuery(request.code)
		);
		return this.mapper.toCredentialFieldsResponse(fields);
	}
}
