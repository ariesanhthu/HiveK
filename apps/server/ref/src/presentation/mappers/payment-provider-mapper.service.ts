import { Injectable, Logger } from '@nestjs/common';
import {
	PaymentProviderCreateRequest,
	PaymentProviderUpdateRequest,
	PaymentProviderDeleteRequest,
	PaymentProviderGetByIdRequest,
	PaymentProviderGetListRequest,
	PaymentProviderResponse,
	PaymentProviderListResponse,
	GetCredentialFieldsResponse,
	CredentialFieldResponse,
	PaymentProviderDeleteResponse,
} from '@/infrastructure/generated/grpc/payment/entities/payment-provider.entity';
import {
	PaymentProviderCreateDto,
	PaymentProviderCreateSchema,
	PaymentProviderUpdateDto,
	PaymentProviderUpdateSchema,
	PaymentProviderDeleteDto,
	PaymentProviderDeleteSchema,
	PaymentProviderDeleteResponseDto,
} from '@/application/commands';
import type { IPaymentProviderField } from '@/core';
import {
	PaymentProviderGetByIdDto,
	PaymentProviderGetByIdSchema,
	PaymentProviderGetListDto,
	PaymentProviderGetListSchema,
} from '@/application/queries';
import { PaymentProviderReducedResponseDto, PaymentProviderResponseDto } from '@/application/dtos';
import { BaseGrpcMapper } from './base-grpc.mapper';
import {
	toDomainCurrency,
	toProtoCurrency,
	toDomainPaymentMethod,
	toProtoPaymentMethod,
	toDomainSortOrder,
} from './grpc-enum.mapper';

@Injectable()
export class PaymentProviderGrpcMapper extends BaseGrpcMapper {
	protected readonly logger = new Logger(PaymentProviderGrpcMapper.name);

	// --- Request to DTO Transformation ---

	toCreateDto(request: PaymentProviderCreateRequest): PaymentProviderCreateDto {
		const raw = {
			code: request.code,
			displayName: request.displayName,
			supportedMethods: request.supportedMethods.map((m) => toDomainPaymentMethod(m, true)),
			supportedCurrencies: request.supportedCurrencies.map((c) => toDomainCurrency(c)),
			credentials: request.credentials,
			isActive: request.isActive,
			supportsWebhook: request.supportsWebhook,
			supportsRefund: request.supportsRefund,
			supportsPartialRefund: request.supportsPartialRefund,
			baseUrl: request.baseUrl || undefined,
			testUrl: request.testUrl || undefined,
			webhookUrl: request.webhookUrl || undefined,
			createdBy: request.createdBy,
		};
		return this.validate(PaymentProviderCreateSchema, raw);
	}

	toUpdateDto(request: PaymentProviderUpdateRequest): PaymentProviderUpdateDto {
		const raw = {
			id: request.id,
			displayName: request.displayName || undefined,
			isActive: request.isActive,
			credentials: request.credentials || undefined,
			updatedBy: request.updatedBy,
		};
		return this.validate(PaymentProviderUpdateSchema, raw);
	}

	toDeleteDto(request: PaymentProviderDeleteRequest): PaymentProviderDeleteDto {
		const raw = {
			id: request.id,
			deletedBy: request.deletedBy,
		};
		return this.validate(PaymentProviderDeleteSchema, raw);
	}

	toGetByIdDto(request: PaymentProviderGetByIdRequest): PaymentProviderGetByIdDto {
		const raw = {
			id: request.id,
		};
		return this.validate(PaymentProviderGetByIdSchema, raw);
	}

	toGetListDto(request: PaymentProviderGetListRequest): PaymentProviderGetListDto {
		const raw = {
			limit: request.limit || undefined,
			cursor: request.cursor || undefined,
			sortOrder: toDomainSortOrder(request.sortOrder),
			isActive: request.isActive,
		};
		return this.validate(PaymentProviderGetListSchema, raw);
	}

	// --- DTO to Response Transformation ---

	/**
	 * Transform DTO to gRPC response.
	 * Handles both Full and Reduced DTOs using type narrowing.
	 */
	toProviderResponse(
		dto: PaymentProviderResponseDto | PaymentProviderReducedResponseDto
	): PaymentProviderResponse {
		// Base mapping for common fields (Required in Proto)
		const response: PaymentProviderResponse = {
			id: dto.id,
			code: dto.code,
			displayName: dto.displayName,
			supportedMethods: dto.supportedMethods?.map((m) => toProtoPaymentMethod(m)) ?? [],
			supportedCurrencies: dto.supportedCurrencies?.map((c) => toProtoCurrency(c)) ?? [],
			isActive: dto.isActive,
			createdAt: dto.createdAt?.toISOString() || '',
			updatedAt: dto.updatedAt?.toISOString() || '',
			credentials: {}, // Maps are always required to be an object in Proto
		};

		// Common fields that are optional in Proto
		response.supportsRefund = dto.supportsRefund;
		response.supportsPartialRefund = dto.supportsPartialRefund;

		// Narrow to access fields only in PaymentProviderResponseDto
		if ('credentials' in dto) {
			response.supportsWebhook = dto.supportsWebhook;
			response.credentials = this.formatCredentials(dto.credentials);
			response.baseUrl = dto.baseUrl;
			response.testUrl = dto.testUrl;
			response.webhookUrl = dto.webhookUrl;
			response.deletedAt = dto.deletedAt?.toISOString();
			response.deletedBy = dto.deletedBy || undefined;
		}

		return response;
	}

	toProviderListResponse(
		items: (PaymentProviderResponseDto | PaymentProviderReducedResponseDto)[],
		nextCursor?: string | null
	): PaymentProviderListResponse {
		return {
			items: items.map((item) => this.toProviderResponse(item)),
			nextCursor: nextCursor || undefined,
		};
	}

	/**
	 * Formats credentials from JsonRecord to Record<string, string> for gRPC map fields.
	 */
	private formatCredentials(credentials: Record<string, unknown>): Record<string, string> {
		return Object.fromEntries(
			Object.entries(credentials).map(([k, v]) => [
				k,
				typeof v === 'string'
					? v
					: v === null || v === undefined
						? ''
						: typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint'
							? String(v)
							: JSON.stringify(v),
			])
		);
	}

	toCredentialFieldsResponse(fields: IPaymentProviderField[]): GetCredentialFieldsResponse {
		return {
			fields: fields.map(
				(field): CredentialFieldResponse => ({
					key: field.key,
					label: field.label,
					required: field.required,
					description: field.description ?? '',
				})
			),
		};
	}

	toProviderDeleteResponse(dto: PaymentProviderDeleteResponseDto): PaymentProviderDeleteResponse {
		return dto;
	}
}
