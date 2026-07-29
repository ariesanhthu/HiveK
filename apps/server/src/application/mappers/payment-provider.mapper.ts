import { PaymentProviderEntity } from '@/core/entities';
import {
  PaymentProviderReducedResponseDto,
  PaymentProviderResponseDto,
} from '../dtos';
import type { EPaymentMethod, ECurrency } from '@/core/enums';

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
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      deletedAt: entity.deletedAt?.toISOString() || null,
      deletedBy: entity.deletedBy || null,
    };
  }

  static toReducedDto(
    entity: PaymentProviderEntity,
  ): PaymentProviderReducedResponseDto {
    return {
      id: entity.id,
      code: entity.code,
      displayName: entity.displayName,
      supportedMethods: entity.supportedMethods,
      supportedCurrencies: entity.supportedCurrencies,
      isActive: entity.isActive,
      supportsRefund: entity.supportsRefund,
      supportsPartialRefund: entity.supportsPartialRefund,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toDtoList(
    entities: PaymentProviderEntity[],
  ): PaymentProviderResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toReducedDtoList(
    entities: PaymentProviderEntity[],
  ): PaymentProviderReducedResponseDto[] {
    return entities.map((entity) => this.toReducedDto(entity));
  }
}
