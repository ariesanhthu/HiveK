import { Injectable, Logger } from '@nestjs/common';
import {
	BillCreateRequest,
	BillCalculateRequest,
	BillCancelRequest,
	BillGetByIdRequest,
	BillGetListRequest,
	Bill as BillProto,
	BillCalculateResponse,
	BillListResponse,
	BillItem as BillItemProto,
} from '@/infrastructure/generated/grpc/payment/entities/bill.entity';
import {
	BillCreateDto,
	BillCalculateDto,
	BillCancelDto,
	BillCalculateResponseDto,
	BillCreateSchema,
	BillCalculateSchema,
	BillCancelSchema,
} from '@/application/commands';
import {
	BillGetByIdDto,
	BillGetListDto,
	BillGetByIdSchema,
	BillGetListSchema,
} from '@/application/queries';
import { BillResponseDto, type BillItemResponseDto } from '@/application/dtos';
import { BaseGrpcMapper } from './base-grpc.mapper';
import {
	toDomainBillStatus,
	toProtoBillStatus,
	toProtoBillType,
	toProtoCurrency,
	toProtoPurchaseType,
	toDomainSortOrder,
} from './grpc-enum.mapper';
import { getCaslContext } from '@sgod-casl/library';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class BillGrpcMapper extends BaseGrpcMapper {
	protected readonly logger = new Logger(BillGrpcMapper.name);

	// --- Request to DTO Transformation ---

	toCreateDto(request: BillCreateRequest): BillCreateDto {
		const ctx = getCaslContext();
		if (!ctx?.userContext?.tenantId) {
			throw new RpcException('Unauthorized');
		}
		const raw = {
			enterpriseId: ctx.userContext.tenantId,
			items: request.items.map((item) => ({
				packageId: item.packageId,
				packageVariantId: item.packageVariantId,
			})),
		};
		return this.validate(BillCreateSchema, raw);
	}

	toCalculateDto(request: BillCalculateRequest): BillCalculateDto {
		const raw = {
			enterpriseId: request.enterpriseId,
			items: request.items.map((item) => ({
				packageId: item.packageId,
				packageVariantId: item.packageVariantId,
			})),
		};
		return this.validate(BillCalculateSchema, raw);
	}

	toCancelDto(request: BillCancelRequest): BillCancelDto {
		const raw = {
			billId: request.billId,
		};
		return this.validate(BillCancelSchema, raw);
	}

	toGetByIdDto(request: BillGetByIdRequest): BillGetByIdDto {
		const raw = {
			id: request.id,
		};
		return this.validate(BillGetByIdSchema, raw);
	}

	toGetListDto(request: BillGetListRequest): BillGetListDto {
		const raw = {
			enterpriseId: request.enterpriseId,
			limit: request.limit || 10,
			cursor: request.cursor || undefined,
			status: toDomainBillStatus(request.status, false),
			sortOrder: toDomainSortOrder(request.sortOrder),
		};
		return this.validate(BillGetListSchema, raw);
	}

	// --- Response Transformation ---

	toBillResponse(dto: BillResponseDto): BillProto {
		return {
			id: dto.id,
			billCode: dto.billCode,
			enterpriseId: dto.enterpriseId,
			type: toProtoBillType(dto.type),
			status: toProtoBillStatus(dto.status),
			items: dto.items.map((item) => this.toProtoBillItem(item)),
			totalAmount: dto.totalAmount,
			creditAmountApplied: dto.creditAmountApplied,
			creditAmountRefund: dto.creditAmountRefund,
			taxAmount: dto.taxAmount,
			finalAmount: dto.finalAmount,
			currency: toProtoCurrency(dto.currency),
			expiresAt: dto.expiresAt ? dto.expiresAt.toISOString() : undefined,
			createdAt: dto.createdAt.toISOString(),
		};
	}

	toBillListResponse(items: BillResponseDto[], nextCursor?: string): BillListResponse {
		return {
			items: items.map((item) => this.toBillResponse(item)),
			nextCursor,
		};
	}

	toBillCalculateResponse(dto: BillCalculateResponseDto): BillCalculateResponse {
		return {
			items: dto.items.map((item) => this.toProtoBillItem(item)),
			totalAmount: dto.totalAmount,
			creditAmountApplied: dto.creditAmountApplied,
			taxAmount: dto.taxAmount,
			finalAmount: dto.finalAmount,
			currency: toProtoCurrency(dto.currency),
		};
	}

	// --- Helpers ---

	private toProtoBillItem(item: BillItemResponseDto): BillItemProto {
		return {
			packageId: item.packageId,
			packageVariantId: item.packageVariantId,
			price: item.price,
			taxPercent: item.taxPercent,
			creditRefundAmount: item.creditRefundAmount,
			purchaseType: toProtoPurchaseType(item.purchaseType),
		};
	}
}
