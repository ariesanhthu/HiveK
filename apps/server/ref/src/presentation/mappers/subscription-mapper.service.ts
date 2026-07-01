import { Injectable, Logger } from '@nestjs/common';
import {
	SubscriptionGetByIdRequest,
	SubscriptionGetByEnterpriseRequest,
	SubscriptionGetListRequest,
	SubscriptionGetHistoryByIdRequest,
	SubscriptionGetListHistoryRequest,
	SubscriptionResponse,
	SubscriptionListResponse,
	SubscriptionHistoryResponse,
	SubscriptionItem as SubscriptionItemProto,
	SubscriptionHistoryDetails as SubscriptionHistoryDetailsProto,
	SubscriptionHistoryItem as SubscriptionHistoryItemProto,
} from '@/infrastructure/generated/grpc/payment/entities/subscription.entity';
import {
	SubscriptionGetByIdDto,
	SubscriptionGetByIdSchema,
} from '@/application/queries/subscription-get-by-id';
import {
	SubscriptionGetByEnterpriseDto,
	SubscriptionGetByEnterpriseSchema,
} from '@/application/queries/subscription-get-by-enterprise';
import {
	SubscriptionGetListDto,
	SubscriptionGetListSchema,
} from '@/application/queries/subscription-get-list';
import {
	SubscriptionGetHistoryByIdDto,
	SubscriptionGetHistoryByIdSchema,
} from '@/application/queries/subscription-get-history-by-id';
import {
	SubscriptionGetListHistoryDto,
	SubscriptionGetListHistorySchema,
} from '@/application/queries/subscription-get-list-history';
import {
	SubscriptionResponseDTO,
	SubscriptionItemDTO,
	SubscriptionHistoryResponseDTO,
	SubscriptionChangeDetailsDTO,
} from '@/application/dtos';
import { BaseGrpcMapper } from './base-grpc.mapper';

@Injectable()
export class SubscriptionGrpcMapper extends BaseGrpcMapper {
	protected readonly logger = new Logger(SubscriptionGrpcMapper.name);

	// --- Request to DTO Transformation ---
	toGetByIdDto(request: SubscriptionGetByIdRequest): SubscriptionGetByIdDto {
		const raw = {
			id: request.id,
		};
		return this.validate(SubscriptionGetByIdSchema, raw);
	}

	toGetByEnterpriseDto(
		request: SubscriptionGetByEnterpriseRequest
	): SubscriptionGetByEnterpriseDto {
		const raw = {
			enterpriseId: request.enterpriseId,
		};
		return this.validate(SubscriptionGetByEnterpriseSchema, raw);
	}

	toGetListDto(request: SubscriptionGetListRequest): SubscriptionGetListDto {
		const raw = {
			enterpriseId: request.enterpriseId || undefined,
			status: request.status || undefined,
			limit: request.limit || 20,
			cursor: request.cursor || undefined,
		};
		return this.validate(SubscriptionGetListSchema, raw);
	}

	toGetHistoryByIdDto(request: SubscriptionGetHistoryByIdRequest): SubscriptionGetHistoryByIdDto {
		const raw = {
			id: request.id,
		};
		return this.validate(SubscriptionGetHistoryByIdSchema, raw);
	}

	toGetListHistoryDto(request: SubscriptionGetListHistoryRequest): SubscriptionGetListHistoryDto {
		const raw = {
			enterpriseId: request.enterpriseId || undefined,
			limit: request.limit || 20,
			cursor: request.cursor || undefined,
		};
		return this.validate(SubscriptionGetListHistorySchema, raw);
	}

	// --- Response Transformation (DTO to Proto) ---

	private toSubscriptionItemProto(dto: SubscriptionItemDTO): SubscriptionItemProto {
		return {
			packageId: dto.packageId,
			packageVariantId: dto.packageVariantId,
			startDate: dto.startDate.toISOString(),
			expiresAt: dto.expiresAt.toISOString(),
		};
	}

	toSubscriptionResponse(dto: SubscriptionResponseDTO): SubscriptionResponse {
		return {
			id: '',
			enterpriseId: dto.enterpriseId,
			status: dto.status,
			items: dto.items.map((item) => this.toSubscriptionItemProto(item)),
			computedQuotas: [],
			computedPermissions: dto.computedPermissions,
			version: 0,
			nextExpiryCheckAt: dto.nextExpiryCheckAt.toISOString(),
			createdAt: dto.createdAt.toISOString(),
			updatedAt: dto.updatedAt.toISOString(),
		};
	}

	private toSubscriptionHistoryDetailsProto(
		dto: SubscriptionChangeDetailsDTO
	): SubscriptionHistoryDetailsProto {
		return {
			oldPackages: [],
			newPackages: [],
			oldQuotas: [],
			newQuotas: [],
			oldPermissions: dto.oldPermissions,
			newPermissions: dto.newPermissions,
		};
	}

	toSubscriptionHistoryItemProto(
		dto: SubscriptionHistoryResponseDTO
	): SubscriptionHistoryItemProto {
		return {
			id: '',
			subscriptionId: dto.subscriptionId,
			billId: dto.billId || undefined,
			actorId: dto.actorId || undefined,
			details: this.toSubscriptionHistoryDetailsProto(dto.details),
			createdAt: dto.createdAt.toISOString(),
		};
	}

	toSubscriptionListResponse(
		items: SubscriptionResponseDTO[],
		nextCursor: string | null
	): SubscriptionListResponse {
		return {
			items: items.map((item) => this.toSubscriptionResponse(item)),
			nextCursor: nextCursor ?? '',
		};
	}

	toSubscriptionHistoryResponse(
		items: SubscriptionHistoryResponseDTO[],
		nextCursor: string | null
	): SubscriptionHistoryResponse {
		return {
			items: items.map((item) => this.toSubscriptionHistoryItemProto(item)),
			nextCursor: nextCursor ?? '',
		};
	}
}
