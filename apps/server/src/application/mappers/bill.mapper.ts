import { BillEntity } from '@/core/aggregate-roots';
import { BillResponseDto, BillCalculateResponseDto } from '../dtos';
import type { EBillType, EBillStatus } from '@/core/enums';

export class BillMapper {
  static toDto(entity: BillEntity): BillResponseDto {
    return {
      id: entity.id!,
      billCode: entity.billCode,
      enterpriseId: entity.enterpriseId,
      type: entity.type as EBillType,
      status: entity.status as EBillStatus,
      items: entity.items.map((item) => ({
        lineType: item.lineType,
        packageId: item.packageId,
        packageVariantId: item.packageVariantId,
        creditType: item.creditType,
        creditAmount: item.creditAmount,
        price: item.price,
        taxPercent: item.taxPercent,
        purchaseType: item.purchaseType,
      })),
      totalAmount: entity.totalAmount,
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
        lineType: item.lineType,
        packageId: item.packageId,
        packageVariantId: item.packageVariantId,
        creditType: item.creditType,
        creditAmount: item.creditAmount,
        price: item.price,
        taxPercent: item.taxPercent,
        purchaseType: item.purchaseType,
      })),
      totalAmount: entity.totalAmount,
      taxAmount: entity.taxAmount,
      finalAmount: entity.finalAmount,
      currency: entity.currency,
    };
  }

  static toDtoList(entities: BillEntity[]): BillResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
