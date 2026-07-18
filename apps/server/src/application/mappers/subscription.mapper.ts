import { SubscriptionRoot, SubscriptionHistoryEntity } from '@/core/aggregate-roots';
import { SubscriptionResponseDto, SubscriptionHistoryResponseDto } from '../dtos';

export class SubscriptionMapper {
  static toDto(entity: SubscriptionRoot): SubscriptionResponseDto {
    return {
      id: entity.id!,
      userId: entity.userId,
      status: entity.status,
      planItem: entity.planItem
        ? {
            packageId: entity.planItem.packageId,
            packageVariantId: entity.planItem.packageVariantId,
            startDate: entity.planItem.startDate,
            expiresAt: entity.planItem.expiresAt,
            billId: entity.planItem.billId,
            autoRenew: entity.planItem.autoRenew,
          }
        : null,
      addonItems: entity.addonItems.map((item) => ({
        packageId: item.packageId,
        packageVariantId: item.packageVariantId,
        purchasedAt: item.purchasedAt,
        expiresAt: item.expiresAt,
        billId: item.billId,
      })),
      computedGrants: entity.computedGrants.map((g) => ({
        type: g.type,
        key: g.key,
        value: g.value,
        resetCycle: g.resetCycle,
        creditFallback: g.creditFallback,
      })),
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
      userId: entity.userId,
      billId: entity.billId ?? null,
      actorId: entity.actorId ?? null,
      details: {
        oldPlanId: entity.details.oldPlanId,
        newPlanId: entity.details.newPlanId,
        addedAddonIds: entity.details.addedAddonIds,
        removedAddonIds: entity.details.removedAddonIds,
        oldGrants: entity.details.oldGrants.map((g) => ({
          type: g.type,
          key: g.key,
          value: g.value,
          resetCycle: g.resetCycle,
          creditFallback: g.creditFallback,
        })),
        newGrants: entity.details.newGrants.map((g) => ({
          type: g.type,
          key: g.key,
          value: g.value,
          resetCycle: g.resetCycle,
          creditFallback: g.creditFallback,
        })),
        oldPermissions: entity.details.oldPermissions,
        newPermissions: entity.details.newPermissions,
      },
      createdAt: entity.createdAt,
    };
  }

  static toDtoList(entities: SubscriptionRoot[]): SubscriptionResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toHistoryDtoList(
    entities: SubscriptionHistoryEntity[]
  ): SubscriptionHistoryResponseDto[] {
    return entities.map((entity) => this.toHistoryDto(entity));
  }
}
