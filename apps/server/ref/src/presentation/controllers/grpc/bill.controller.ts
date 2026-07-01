import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BillGrpcExceptionFilter } from '@/presentation/middlewares/filters';
import { CaslAction, CheckPolicies } from '@sgod-casl/library';
import { GrpcAutoMapInterceptor } from '@/presentation/middlewares/interceptors';
import { GrpcAutoResponse } from '@/presentation/decorators/grpc-auto-response.decorator';
import {
	CaslSubject,
	PaymentGrpcCaslGuard,
	PaymentGrpcMetadataExtractGuard,
} from '@/shared/permissions/casl';
import { BillServiceControllerMethods } from '@/infrastructure/generated/grpc/payment/repositories/bill.repository';
import {
	type BillCreateRequest,
	type BillCalculateRequest,
	type BillCancelRequest,
	type BillGetByIdRequest,
	type BillGetListRequest,
	BillCalculateResponse,
} from '@/infrastructure/generated/grpc/payment/entities/bill.entity';
import { Empty } from '@/infrastructure/generated/grpc/common/common';
import type { BillResponseDto } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';
import { BillCreateCommand, BillCalculateCommand, BillCancelCommand } from '@/application/commands';
import { BillGetListQuery, BillGetByIdQuery } from '@/application/queries';
import { BillGrpcMapper } from '@/presentation/mappers';

@Controller()
@UseFilters(new BillGrpcExceptionFilter())
@UseInterceptors(GrpcAutoMapInterceptor)
@BillServiceControllerMethods()
export class BillController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly mapper: BillGrpcMapper
	) {}

	/**
	 * Create a new bill
	 * Permissions: Logged-in Enterprise
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Create, CaslSubject.Bill))
	@GrpcAutoResponse({
		subject: CaslSubject.Bill,
		mapper: BillGrpcMapper,
		method: 'toBillResponse',
	})
	async create(request: BillCreateRequest): Promise<BillResponseDto> {
		const dto = this.mapper.toCreateDto(request);
		return this.commandBus.execute(new BillCreateCommand(dto));
	}

	async calculate(request: BillCalculateRequest): Promise<BillCalculateResponse> {
		const dto = this.mapper.toCalculateDto(request);
		const result = await this.commandBus.execute(new BillCalculateCommand(dto));
		return this.mapper.toBillCalculateResponse(result);
	}

	/**
	 * Cancel a bill
	 * Permissions: CancelOwnBill (ENTERPRISE)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.CancelBill, CaslSubject.Bill))
	async cancel(request: BillCancelRequest): Promise<Empty> {
		const dto = this.mapper.toCancelDto(request);
		await this.commandBus.execute(new BillCancelCommand(dto));
		return {};
	}

	/**
	 * Get bill by ID
	 * Permissions: ReadOwnBills (ENTERPRISE), ReadAllBills (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Bill))
	@GrpcAutoResponse({
		subject: CaslSubject.Bill,
		mapper: BillGrpcMapper,
		method: 'toBillResponse',
	})
	async getById(request: BillGetByIdRequest): Promise<BillResponseDto> {
		const dto = this.mapper.toGetByIdDto(request);
		return this.queryBus.execute(new BillGetByIdQuery(dto));
	}

	/**
	 * Get list of bills
	 * Permissions: ReadOwnBills (ENTERPRISE), ReadAllBills (SGOD)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Bill))
	@GrpcAutoResponse({
		subject: CaslSubject.Bill,
		mapper: BillGrpcMapper,
		method: 'toBillListResponse',
	})
	async getList(
		request: BillGetListRequest
	): Promise<PaginationCursorResponseDto<BillResponseDto>> {
		const dto = this.mapper.toGetListDto(request);
		return this.queryBus.execute(new BillGetListQuery(dto));
	}
}
