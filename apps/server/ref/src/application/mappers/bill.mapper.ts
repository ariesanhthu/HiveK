import { type BillEntity } from '@/core';
import { type BillResponseDto } from '../dtos';
import { type BillCalculateResponseDto } from '../commands';

export class BillMapper {
	static toDto(entity: BillEntity): BillResponseDto {
		return {
			id: entity.id,
			billCode: entity.billCode,
			enterpriseId: entity.enterpriseId,
			type: entity.type,
			status: entity.status,
			items: entity.items.map((item) => ({
				packageId: item.packageId,
				packageVariantId: item.packageVariantId,
				price: item.price,
				taxPercent: item.taxPercent,
				creditRefundAmount: item.creditRefundAmount,
				purchaseType: item.purchaseType,
			})),
			totalAmount: entity.totalAmount,
			creditAmountApplied: entity.creditAmountApplied,
			creditAmountRefund: entity.creditAmountRefund,
			taxAmount: entity.taxAmount,
			finalAmount: entity.finalAmount,
			currency: entity.currency,
			expiresAt: entity.expiresAt,
			createdAt: entity.createdAt,
		};
	}

	static toCalculateDto(entity: BillEntity): BillCalculateResponseDto {
		return {
			items: entity.items.map((item) => ({
				packageId: item.packageId,
				packageVariantId: item.packageVariantId,
				price: item.price,
				taxPercent: item.taxPercent,
				creditRefundAmount: item.creditRefundAmount,
				purchaseType: item.purchaseType,
			})),
			totalAmount: entity.totalAmount,
			creditAmountApplied: entity.creditAmountApplied,
			taxAmount: entity.taxAmount,
			finalAmount: entity.finalAmount,
			currency: entity.currency,
		};
	}

	static toDtoList(entities: BillEntity[]): BillResponseDto[] {
		return entities.map((entity) => this.toDto(entity));
	}
}
