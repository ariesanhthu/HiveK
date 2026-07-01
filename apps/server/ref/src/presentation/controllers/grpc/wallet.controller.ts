import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GrpcExceptionFilter } from '@/presentation/middlewares/filters/grpc/global.filter';
import { CaslAction, CheckPolicies } from '@sgod-casl/library';
import { GrpcAutoMapInterceptor } from '@/presentation/middlewares/interceptors';
import { GrpcAutoResponse } from '@/presentation/decorators/grpc-auto-response.decorator';
import {
	CaslSubject,
	PaymentGrpcCaslGuard,
	PaymentGrpcMetadataExtractGuard,
} from '@/shared/permissions/casl';
import { WalletServiceControllerMethods } from '@/infrastructure/generated/grpc/payment/repositories/wallet.repository';
import type {
	WalletGetByIdRequest,
	WalletGetByEnterpriseRequest,
	WalletGetListRequest,
	WalletGetListTransactionRequest,
	WalletTransactionGetByIdRequest,
} from '@/infrastructure/generated/grpc/payment/entities/wallet.entity';
import type { WalletResponseDTO, WalletTransactionResponseDTO } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';
import {
	WalletGetByIdQuery,
	WalletGetByEnterpriseQuery,
	WalletGetListQuery,
	WalletGetListTransactionQuery,
	WalletTransactionGetByIdQuery,
} from '@/application/queries';
import { WalletGrpcMapper } from '@/presentation/mappers';

@Controller()
@UseFilters(new GrpcExceptionFilter())
@UseInterceptors(GrpcAutoMapInterceptor)
@WalletServiceControllerMethods()
export class WalletController {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly mapper: WalletGrpcMapper
	) {}

	/**
	 * Get wallet by ID
	 *
	 * Permissions:
	 * - SGOD: ReadAllWallets (can read any wallet)
	 * - ENTERPRISE: ReadOwnWallet (can read only own wallets)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Wallet))
	@GrpcAutoResponse({
		subject: CaslSubject.Wallet,
		mapper: WalletGrpcMapper,
		method: 'toWalletResponse',
	})
	async getById(request: WalletGetByIdRequest): Promise<WalletResponseDTO> {
		const dto = this.mapper.toGetByIdDto(request);
		return this.queryBus.execute(new WalletGetByIdQuery(dto));
	}

	/**
	 * Get wallet by enterprise/tenant ID
	 *
	 * Permissions:
	 * - SGOD: ReadAllWallets (can read any enterprise's wallet)
	 * - ENTERPRISE: ReadOwnWallet (can read only their tenant's wallet)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Wallet))
	@GrpcAutoResponse({
		subject: CaslSubject.Wallet,
		mapper: WalletGrpcMapper,
		method: 'toWalletResponse',
	})
	async getByEnterprise(request: WalletGetByEnterpriseRequest): Promise<WalletResponseDTO> {
		const dto = this.mapper.toGetByEnterpriseDto(request);
		return this.queryBus.execute(new WalletGetByEnterpriseQuery(dto));
	}

	/**
	 * Get list of wallets
	 *
	 * Permissions:
	 * - SGOD: ReadAllWallets (can list all wallets system-wide)
	 * - ENTERPRISE: ReadOwnWallet (can list only own tenant's wallets)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.Wallet))
	@GrpcAutoResponse({
		subject: CaslSubject.Wallet,
		mapper: WalletGrpcMapper,
		method: 'toWalletListResponse',
	})
	async getList(
		request: WalletGetListRequest
	): Promise<PaginationCursorResponseDto<WalletResponseDTO>> {
		const dto = this.mapper.toGetListDto(request);
		return this.queryBus.execute(new WalletGetListQuery(dto));
	}

	/**
	 * Get list of transactions for a wallet
	 *
	 * Permissions:
	 * - SGOD: ReadAllTransactions (can read any wallet's transactions)
	 * - ENTERPRISE: ReadOwnTransactions (can read only own wallet's transactions)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.WalletTransaction))
	@GrpcAutoResponse({
		subject: CaslSubject.WalletTransaction,
		mapper: WalletGrpcMapper,
		method: 'toWalletTransactionListResponse',
	})
	async getListTransaction(
		request: WalletGetListTransactionRequest
	): Promise<PaginationCursorResponseDto<WalletTransactionResponseDTO>> {
		const dto = this.mapper.toGetListTransactionDto(request);
		return this.queryBus.execute(new WalletGetListTransactionQuery(dto));
	}

	/**
	 * Get transaction by ID
	 *
	 * Permissions:
	 * - SGOD: ReadAllTransactions (can read any transaction)
	 * - ENTERPRISE: ReadOwnTransactions (can read only own transactions)
	 */
	@UseGuards(PaymentGrpcMetadataExtractGuard, PaymentGrpcCaslGuard)
	@CheckPolicies((ability) => ability.can(CaslAction.Read, CaslSubject.WalletTransaction))
	@GrpcAutoResponse({
		subject: CaslSubject.WalletTransaction,
		mapper: WalletGrpcMapper,
		method: 'toWalletTransactionResponse',
	})
	async getTransactionById(
		request: WalletTransactionGetByIdRequest
	): Promise<WalletTransactionResponseDTO> {
		const dto = this.mapper.toGetTransactionByIdDto(request);
		return this.queryBus.execute(new WalletTransactionGetByIdQuery(dto));
	}
}
