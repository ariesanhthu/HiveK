import { type SubscriptionEntity, type SubscriptionHistoryEntity } from '@/core';
import { type SubscriptionResponseDTO } from '../dtos';
import { type SubscriptionHistoryResponseDTO } from '../dtos/subscription-history-response.dto';

export class SubscriptionMapper {
	static toDto(entity: SubscriptionEntity): SubscriptionResponseDTO {
		return {
			enterpriseId: entity.enterpriseId,
			status: entity.status,
			items: entity.items.map((item) => ({
				packageId: item.packageId,
				packageVariantId: item.packageVariantId,
				startDate: item.startDate,
				expiresAt: item.expiresAt,
			})),
			computedQuotas: entity.computedQuotas,
			computedPermissions: entity.computedPermissions,
			nextExpiryCheckAt: entity.nextExpiryCheckAt,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	static toHistoryDto(entity: SubscriptionHistoryEntity): SubscriptionHistoryResponseDTO {
		return {
			subscriptionId: entity.subscriptionId,
			enterpriseId: entity.enterpriseId,
			billId: entity.billId ?? null,
			actorId: entity.actorId ?? null,
			details: {
				oldPackages: entity.details.oldPackages,
				newPackages: entity.details.newPackages,
				oldQuotas: entity.details.oldQuotas,
				newQuotas: entity.details.newQuotas,
				oldPermissions: entity.details.oldPermissions,
				newPermissions: entity.details.newPermissions,
			},
			createdAt: entity.createdAt,
		};
	}

	static toDtoList(entities: SubscriptionEntity[]): SubscriptionResponseDTO[] {
		return entities.map((entity) => this.toDto(entity));
	}

	static toHistoryDtoList(
		entities: SubscriptionHistoryEntity[]
	): SubscriptionHistoryResponseDTO[] {
		return entities.map((entity) => this.toHistoryDto(entity));
	}
}
