import { PackageEntity } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';
import { PackageResponseDto, PackageVariantDto } from '../dtos';

export class PackageMapper {
  static toDto(entity: PackageEntity): PackageResponseDto {
    const baseQuotas = Object.fromEntries(
      Object.entries(entity.baseQuotas.unmarshal).filter(([_, v]) => v !== undefined)
    ) as Record<string, number>;

    return {
      id: entity.id!,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      scope: entity.scope,
      enterpriseId: entity.enterpriseId,
      status: entity.status,
      features: entity.features.map((f) => ({
        code: f.code,
        permissions: f.permissions,
      })),
      baseQuotas,
      variants: entity.variants.map((v) => this.toVariantDto(v)),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      activatedAt: entity.activatedAt || undefined,
    };
  }

  static toVariantDto(entity: PackageVariantEntity): PackageVariantDto {
    const extraQuotas = Object.fromEntries(
      Object.entries(entity.extraQuotas.unmarshal).filter(([_, v]) => v !== undefined)
    ) as Record<string, number>;

    return {
      id: entity.id!,
      title: entity.title,
      durationMonths: entity.durationMonths,
      price: entity.price,
      priceAfterDiscount: entity.priceAfterDiscount,
      tax: entity.tax,
      currency: entity.currency,
      extraQuotas,
    };
  }

  static toDtoList(entities: PackageEntity[]): PackageResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
