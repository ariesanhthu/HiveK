import { PackageRoot } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';
import { PackageResponseDto, PackageVariantDto } from '../dtos';

export class PackageMapper {
  static toDto(entity: PackageRoot): PackageResponseDto {
    return {
      id: entity.id!,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      scope: entity.scope,
      enterpriseId: entity.enterpriseId,
      status: entity.status,
      features: entity.features,
      baseGrants: entity.baseGrants.map((g) => ({
        type: g.type,
        key: g.key,
        value: g.value,
        resetCycle: g.resetCycle,
        creditFallback: g.creditFallback,
      })),
      variants: entity.variants.map((v) => this.toVariantDto(v)),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      activatedAt: entity.activatedAt || undefined,
    };
  }

  static toVariantDto(entity: PackageVariantEntity): PackageVariantDto {
    return {
      id: entity.id!,
      title: entity.title,
      durationMonths: entity.durationMonths,
      price: entity.price,
      priceAfterDiscount: entity.priceAfterDiscount,
      tax: entity.tax,
      currency: entity.currency,
      extraGrants: entity.extraGrants.map((g) => ({
        type: g.type,
        key: g.key,
        value: g.value,
        resetCycle: g.resetCycle,
        creditFallback: g.creditFallback,
      })),
    };
  }

  static toDtoList(entities: PackageRoot[]): PackageResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
