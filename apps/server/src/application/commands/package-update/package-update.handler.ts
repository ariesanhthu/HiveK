import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageUpdateCommand } from './package-update.command';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { PackageEntity } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';
import { PackageResponseDto, PackageVariantDto, VariantDto, QuotaItemDto } from '@/application/dtos';
import { PackageMapper } from '@/application/mappers';
import { EVersionStatus } from '@/core/enums';
import { PackageFeatureVO, QuotaVO } from '@/core/value-objects';
import { PackageNotFoundException, DuplicateVariantException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PackageUpdateCommand)
export class PackageUpdateHandler implements ICommandHandler<PackageUpdateCommand, PackageResponseDto> {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PackageUpdateCommand): Promise<PackageResponseDto> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Retrieve Target Package
      const pkg = await this.packageRepository.findById(input.id);
      if (!pkg) {
        throw new PackageNotFoundException(input.id);
      }

      // 2. Validate Status
      if (pkg.status !== EVersionStatus.DRAFT) {
        throw new Error(
          `Cannot update package with status '${pkg.status}'. Only DRAFT packages can be updated.`
        );
      }

      // 3. Update General Info & Metadata
      this.handleGeneralUpdates(pkg, input);

      // 4. Process Variants
      this.handleDeleteVariants(pkg, input.deletedVariants);
      this.handleUpdateVariants(pkg, input.currentVariants);
      this.handleAddVariants(pkg, input.newVariants);

      // 5. Validate Business Rules (Unique Titles)
      this.validateUniqueTitles(pkg);

      // 6. Persist
      await this.packageRepository.save(pkg);

      return PackageMapper.toDto(pkg);
    });
  }

  private handleGeneralUpdates(pkg: PackageEntity, dto: any) {
    let features: PackageFeatureVO[] | undefined;
    let baseQuotas: QuotaVO | undefined;

    if (dto.features) {
      features = dto.features.map(
        (f: any) => new PackageFeatureVO({ code: f.code, permissions: f.permissions })
      );
    }
    if (dto.baseQuotas) {
      baseQuotas = this.mapQuotaItemsToVO(dto.baseQuotas);
    }

    pkg.updateGeneralInfo({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      scope: dto.scope,
      features,
      baseQuotas,
    });
  }

  private handleDeleteVariants(pkg: PackageEntity, deletedIds?: string[]) {
    if (!deletedIds || deletedIds.length === 0) return;

    for (const id of deletedIds) {
      pkg.removeVariant(id);
    }
  }

  private handleUpdateVariants(pkg: PackageEntity, updates?: any[]) {
    if (!updates || updates.length === 0) return;

    for (const updateDto of updates) {
      const variant = pkg.variants.find((v) => v.id === updateDto.id);
      if (variant) {
        variant.update({
          title: updateDto.title,
          durationMonths: updateDto.durationMonths,
          price: updateDto.price,
          priceAfterDiscount: updateDto.priceAfterDiscount,
          tax: updateDto.tax,
          currency: updateDto.currency,
          extraQuotas: updateDto.extraQuotas
            ? this.mapQuotaItemsToVO(updateDto.extraQuotas)
            : undefined,
        });
      }
    }
  }

  private handleAddVariants(pkg: PackageEntity, newVariants?: VariantDto[]) {
    if (!newVariants || newVariants.length === 0) return;

    for (const v of newVariants) {
      const newVariant = PackageVariantEntity.create({
        title: v.title,
        durationMonths: v.durationMonths,
        price: v.price,
        priceAfterDiscount: v.priceAfterDiscount,
        tax: v.tax,
        currency: v.currency as any,
        extraQuotas: this.mapQuotaItemsToVO(v.extraQuotas),
      });
      pkg.variants.push(newVariant);
    }
  }

  private validateUniqueTitles(pkg: PackageEntity) {
    const titles = new Set<string>();
    for (const v of pkg.variants) {
      if (titles.has(v.title)) {
        throw new DuplicateVariantException(`Variant title '${v.title}' is duplicated.`);
      }
      titles.add(v.title);
    }
  }

  private mapQuotaItemsToVO(items: QuotaItemDto[]): QuotaVO {
    const props: { [key: string]: number } = {};
    for (const item of items) {
      props[item.code] = item.limit;
    }
    return new QuotaVO(props);
  }
}
