import { Injectable, Logger } from '@nestjs/common';
import {
	PaymentCreateRequest,
	PaymentRetryRequest,
	PaymentHandleWebhookRequest,
	PaymentGetByIdRequest,
	PaymentGetListRequest,
	Payment as PaymentProto,
	PaymentRetryResponse,
	PaymentListResponse,
	PaymentCreateResponse,
} from '@/infrastructure/generated/grpc/payment/entities/payment.entity';
import {
	PaymentCreateDto,
	PaymentCreateSchema,
	PaymentRetryDto,
	PaymentRetrySchema,
	PaymentHandleWebhookDto,
	PaymentHandleWebhookSchema,
	PaymentCreateResponseDto,
} from '@/application/commands';
import {
	PaymentGetByIdDto,
	PaymentGetListDto,
	PaymentGetByIdSchema,
	PaymentGetListSchema,
} from '@/application/queries';
import { PaymentResponseDto } from '@/application/dtos';
import { BaseGrpcMapper } from './base-grpc.mapper';
import {
	toDomainCurrency,
	toProtoCurrency,
	toProtoPaymentStatus,
	toDomainPaymentStatus,
	toDomainSortOrder,
} from './grpc-enum.mapper';
import type { JsonRecord, JsonValue } from '@/shared/types';

@Injectable()
export class PaymentGrpcMapper extends BaseGrpcMapper {
	protected readonly logger = new Logger(PaymentGrpcMapper.name);

	// --- Request to DTO Transformation ---

	toCreateDto(request: PaymentCreateRequest): PaymentCreateDto {
		console.log(request);
		const raw = {
			enterpriseId: request.enterpriseId,
			userId: request.userId,
			billId: request.billId,
			amount: request.amount,
			currency: toDomainCurrency(request.currency),
			description: request.description,
			idempotencyKey: request.idempotencyKey,
			paymentProviderId: request.paymentProviderId,
			createdBy: request.createdBy,
		};
		return this.validate(PaymentCreateSchema, raw);
	}

	toRetryDto(request: PaymentRetryRequest): PaymentRetryDto {
		const raw = {
			paymentId: request.paymentId,
			paymentProviderId: request.paymentProviderId,
			createdBy: request.createdBy,
			idempotencyKey: request.idempotencyKey,
		};
		return this.validate(PaymentRetrySchema, raw);
	}

	toHandleWebhookDto(request: PaymentHandleWebhookRequest): PaymentHandleWebhookDto {
		// Convert proto map<string, string> to JsonRecord (parse JSON values when possible)
		const data: JsonRecord = {};
		for (const [key, value] of Object.entries(request.data)) {
			// Try to parse as JSON, otherwise keep as string
			try {
				data[key] = JSON.parse(value) as JsonValue;
			} catch {
				data[key] = value;
			}
		}

		const raw = {
			code: request.code,
			data,
		};
		return this.validate(PaymentHandleWebhookSchema, raw);
	}

	toGetByIdDto(request: PaymentGetByIdRequest): PaymentGetByIdDto {
		const raw = {
			id: request.id,
		};
		return this.validate(PaymentGetByIdSchema, raw);
	}

	toGetListDto(request: PaymentGetListRequest): PaymentGetListDto {
		const raw = {
			enterpriseId: request.enterpriseId,
			status: toDomainPaymentStatus(request.status, false),
			isDeleted: request.isDeleted,
			startDate: request.startDate ? new Date(request.startDate) : undefined,
			endDate: request.endDate ? new Date(request.endDate) : undefined,
			limit: request.limit || 10,
			cursor: request.cursor || undefined,
			sortOrder: toDomainSortOrder(request.sortOrder),
		};
		return this.validate(PaymentGetListSchema, raw);
	}

	// --- Response Transformation ---

	toPaymentResponse(dto: PaymentResponseDto): PaymentProto {
		return {
			id: dto.id,
			enterpriseId: dto.enterpriseId,
			userId: dto.userId ?? undefined,
			billId: dto.billId,
			amount: dto.amount,
			currency: toProtoCurrency(dto.currency),
			status: toProtoPaymentStatus(dto.status),
			description: dto.description,
			idempotencyKey: dto.idempotencyKey ?? '',
			canceledAt: dto.canceledAt ? dto.canceledAt.toISOString() : undefined,
			canceledBy: dto.canceledBy,
			cancelReason: dto.cancelReason,
			createdAt: dto.createdAt.toISOString(),
			updatedAt: dto.updatedAt.toISOString(),
		};
	}

	toPaymentListResponse(items: PaymentResponseDto[], nextCursor?: string): PaymentListResponse {
		return {
			items: items.map((item) => this.toPaymentResponse(item)),
			nextCursor,
		};
	}

	toRetryResponse(result: { paymentUrl?: string }): PaymentRetryResponse {
		return {
			paymentUrl: result.paymentUrl,
		};
	}

	toCreateResponse(result: PaymentCreateResponseDto): PaymentCreateResponse {
		return {
			paymentId: result.paymentId,
			attemptId: result.attemptId,
			paymentUrl: result.paymentUrl,
		};
	}
}
