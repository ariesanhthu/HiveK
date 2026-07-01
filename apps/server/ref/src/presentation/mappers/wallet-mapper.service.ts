import { Injectable, Logger } from '@nestjs/common';
import {
	WalletGetByIdRequest,
	WalletGetByEnterpriseRequest,
	WalletGetListRequest,
	WalletGetListTransactionRequest,
	WalletTransactionGetByIdRequest,
	WalletResponse,
	WalletListResponse,
	WalletTransactionResponse,
	WalletTransactionListResponse,
} from '@/infrastructure/generated/grpc/payment/entities/wallet.entity';
import {
	WalletGetByIdDto,
	WalletGetByEnterpriseDto,
	WalletGetListDto,
	WalletGetListTransactionDto,
	WalletTransactionGetByIdDto,
	WalletGetByIdSchema,
	WalletGetByEnterpriseSchema,
	WalletGetListSchema,
	WalletGetListTransactionSchema,
	WalletTransactionGetByIdSchema,
} from '@/application/queries';
import { WalletResponseDTO, WalletTransactionResponseDTO } from '@/application/dtos';
import { BaseGrpcMapper } from './base-grpc.mapper';

@Injectable()
export class WalletGrpcMapper extends BaseGrpcMapper {
	protected readonly logger = new Logger(WalletGrpcMapper.name);

	// --- Request to DTO Transformation ---

	toGetByIdDto(request: WalletGetByIdRequest): WalletGetByIdDto {
		const raw = {
			id: request.id,
		};
		return this.validate(WalletGetByIdSchema, raw);
	}

	toGetByEnterpriseDto(request: WalletGetByEnterpriseRequest): WalletGetByEnterpriseDto {
		const raw = {
			enterpriseId: request.enterpriseId,
		};
		return this.validate(WalletGetByEnterpriseSchema, raw);
	}

	toGetListDto(request: WalletGetListRequest): WalletGetListDto {
		const raw = {
			enterpriseId: request.enterpriseId || undefined,
			limit: request.limit || 20,
			cursor: request.cursor || undefined,
			sortOrder: request.sortOrder || undefined,
		};
		return this.validate(WalletGetListSchema, raw);
	}

	toGetListTransactionDto(request: WalletGetListTransactionRequest): WalletGetListTransactionDto {
		const raw = {
			enterpriseId: request.enterpriseId || undefined,
			limit: request.limit || 20,
			cursor: request.cursor || undefined,
			sortOrder: request.sortOrder || undefined,
		};
		return this.validate(WalletGetListTransactionSchema, raw);
	}

	toGetTransactionByIdDto(request: WalletTransactionGetByIdRequest): WalletTransactionGetByIdDto {
		const raw = {
			id: request.id,
		};
		return this.validate(WalletTransactionGetByIdSchema, raw);
	}

	// --- Response Transformation (DTO to Proto) ---

	toWalletResponse(dto: WalletResponseDTO): WalletResponse {
		return {
			id: dto.id,
			enterpriseId: dto.enterpriseId,
			balanceAmount: dto.balanceAmount,
			balanceCurrency: dto.balanceCurrency,
			createdAt: dto.createdAt.toISOString(),
			updatedAt: dto.updatedAt.toISOString(),
		};
	}

	toWalletListResponse(
		items: WalletResponseDTO[],
		nextCursor: string | null
	): WalletListResponse {
		return {
			items: items.map((item) => this.toWalletResponse(item)),
			nextCursor: nextCursor ?? '',
		};
	}

	toWalletTransactionResponse(dto: WalletTransactionResponseDTO): WalletTransactionResponse {
		return {
			id: dto.id,
			walletId: dto.walletId,
			type: dto.type,
			amountValue: dto.amountValue,
			amountCurrency: dto.amountCurrency,
			billId: dto.billId,
			idempotencyKey: dto.idempotencyKey,
			description: dto.description,
			metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
			createdAt: dto.createdAt.toISOString(),
		};
	}

	toWalletTransactionListResponse(
		items: WalletTransactionResponseDTO[],
		nextCursor: string | null
	): WalletTransactionListResponse {
		return {
			items: items.map((item) => this.toWalletTransactionResponse(item)),
			nextCursor: nextCursor ?? '',
		};
	}
}
