import { type PaymentProviderEntity } from '@/core';
import { type PaymentProviderReducedResponseDto, type PaymentProviderResponseDto } from '../dtos';

export class PaymentProviderMapper {
	static toDto(entity: PaymentProviderEntity): PaymentProviderResponseDto {
		return {
			id: entity.id,
			code: entity.code,
			displayName: entity.displayName,
			supportedMethods: entity.supportedMethods,
			supportedCurrencies: entity.supportedCurrencies,
			isActive: entity.isActive,
			supportsWebhook: entity.supportsWebhook,
			supportsRefund: entity.supportsRefund,
			supportsPartialRefund: entity.supportsPartialRefund,
			credentials: entity.credentials,
			baseUrl: entity.baseUrl || undefined,
			testUrl: entity.testUrl || undefined,
			webhookUrl: entity.webhookUrl || undefined,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			deletedAt: entity.deletedAt || null,
			deletedBy: entity.deletedBy || null,
		};
	}

	static toReducedDto(entity: PaymentProviderEntity): PaymentProviderReducedResponseDto {
		return {
			id: entity.id,
			code: entity.code,
			displayName: entity.displayName,
			supportedMethods: entity.supportedMethods,
			supportedCurrencies: entity.supportedCurrencies,
			isActive: entity.isActive,
			supportsRefund: entity.supportsRefund,
			supportsPartialRefund: entity.supportsPartialRefund,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	static toDtoList(entities: PaymentProviderEntity[]): PaymentProviderResponseDto[] {
		return entities.map((entity) => this.toDto(entity));
	}

	static toReducedDtoList(
		entities: PaymentProviderEntity[]
	): PaymentProviderReducedResponseDto[] {
		return entities.map((entity) => this.toReducedDto(entity));
	}
}
