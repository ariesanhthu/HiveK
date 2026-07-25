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
            startDate: entity.planItem.startDate.toISOString(),
            expiresAt: entity.planItem.expiresAt.toISOString(),
            billId: entity.planItem.billId,
            autoRenew: entity.planItem.autoRenew,
            price: entity.planItem.price,
            priceAfterDiscount: entity.planItem.priceAfterDiscount,
          }
        : null,
      addonItems: entity.addonItems.map((item) => ({
        packageId: item.packageId,
        packageVariantId: item.packageVariantId,
        purchasedAt: item.purchasedAt.toISOString(),
        expiresAt: item.expiresAt ? item.expiresAt.toISOString() : null,
        billId: item.billId,
        price: item.price,
        priceAfterDiscount: item.priceAfterDiscount,
      })),
      computedGrants: entity.computedGrants.map((g) => ({
        type: g.type,
        key: g.key,
        value: g.value,
        resetCycle: g.resetCycle,
        creditFallback: g.creditFallback,
      })),
      computedPermissions: entity.computedPermissions,
      nextExpiryCheckAt: entity.nextExpiryCheckAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
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
      createdAt: entity.createdAt.toISOString(),
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
