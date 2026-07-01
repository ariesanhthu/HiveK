import { SubscriptionEntity, SubscriptionHistoryEntity } from '@/core/aggregate-roots';
import { SubscriptionResponseDto, SubscriptionHistoryResponseDto } from '../dtos';

export class SubscriptionMapper {
  static toDto(entity: SubscriptionEntity): SubscriptionResponseDto {
    return {
      id: entity.id!,
      enterpriseId: entity.enterpriseId,
      status: entity.status,
      items: entity.items.map((item) => ({
        packageId: item.packageId,
        packageVariantId: item.packageVariantId,
        startDate: item.startDate,
        expiresAt: item.expiresAt,
      })),
      computedQuotas: entity.computedQuotas.unmarshal,
      computedPermissions: entity.computedPermissions,
      nextExpiryCheckAt: entity.nextExpiryCheckAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toHistoryDto(entity: SubscriptionHistoryEntity): SubscriptionHistoryResponseDto {
    return {
      id: entity.id!,
      subscriptionId: entity.subscriptionId,
      enterpriseId: entity.enterpriseId,
      billId: entity.billId ?? null,
      actorId: entity.actorId ?? null,
      details: {
        oldPackages: entity.details.oldPackages,
        newPackages: entity.details.newPackages,
        oldQuotas: entity.details.oldQuotas.unmarshal,
        newQuotas: entity.details.newQuotas.unmarshal,
        oldPermissions: entity.details.oldPermissions,
        newPermissions: entity.details.newPermissions,
      },
      createdAt: entity.createdAt,
    };
  }

  static toDtoList(entities: SubscriptionEntity[]): SubscriptionResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toHistoryDtoList(
    entities: SubscriptionHistoryEntity[]
  ): SubscriptionHistoryResponseDto[] {
    return entities.map((entity) => this.toHistoryDto(entity));
  }
}
