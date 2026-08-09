import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PackageUpdateCommand } from './package-update.command';
import {
  PackageUpdateInputDto,
  type UpdateVariantDto,
} from './package-update.dto';
import {
  PACKAGE_REPOSITORY,
  type IPackageRepository,
} from '@/core/interfaces/repositories';
import { PackageRoot } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';
import {
  PackageResponseDto,
  VariantDto,
  type GrantDto,
} from '@/application/dtos';
import { PackageMapper } from '@/application/mappers';
import { EVersionStatus, ECurrency } from '@/core/enums';
import { GrantVO } from '@/core/value-objects';
import {
  PackageNotFoundException,
  DuplicateVariantException,
} from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PackageUpdateCommand)
export class PackageUpdateHandler implements ICommandHandler<
  PackageUpdateCommand,
  PackageResponseDto
> {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PackageUpdateCommand): Promise<PackageResponseDto> {
    const { id, input } = command;

    return this.uow.execute(async () => {
      // 1. Fetch package
      const pkg = await this.packageRepository.findById(id);
      if (!pkg) {
        throw new PackageNotFoundException(id);
      }

      // 2. Reject changes to non-draft packages
      if (pkg.status !== EVersionStatus.DRAFT) {
        throw new Error('Can only update packages in DRAFT status.');
      }

      // 3. Update top-level info
      this.handleGeneralUpdates(pkg, input);

      // 4. Update variants list
      this.handleDeleteVariants(pkg, input.deletedVariantIds);
      this.handleUpdateVariants(pkg, input.variants);
      this.handleAddVariants(pkg, input.newVariants);

      // 5. Validation constraints
      this.validateUniqueTitles(pkg);

      // 6. Persist
      await this.packageRepository.save(pkg);

      return PackageMapper.toDto(pkg);
    });
  }

  private handleGeneralUpdates(pkg: PackageRoot, dto: PackageUpdateInputDto) {
    let features: string[] | undefined;
    let baseGrants: GrantVO[] | undefined;

    if (dto.features) {
      features = dto.features;
    }
    if (dto.baseGrants) {
      baseGrants = this.mapGrantDtosToVOs(dto.baseGrants);
    }

    pkg.updateGeneralInfo({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      scope: dto.scope,
      features,
      baseGrants,
    });
  }

  private handleDeleteVariants(pkg: PackageRoot, deletedIds?: string[]) {
    if (!deletedIds || deletedIds.length === 0) return;

    for (const id of deletedIds) {
      pkg.removeVariant(id);
    }
  }

  private handleUpdateVariants(pkg: PackageRoot, updates?: UpdateVariantDto[]) {
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
          extraGrants: updateDto.extraGrants
            ? this.mapGrantDtosToVOs(updateDto.extraGrants)
            : undefined,
        });
      }
    }
  }

  private handleAddVariants(pkg: PackageRoot, newVariants?: VariantDto[]) {
    if (!newVariants || newVariants.length === 0) return;

    for (const v of newVariants) {
      const newVariant = PackageVariantEntity.create({
        title: v.title,
        durationMonths: v.durationMonths,
        price: v.price,
        priceAfterDiscount: v.priceAfterDiscount,
        tax: v.tax,
        currency: v.currency,
        extraGrants: this.mapGrantDtosToVOs(v.extraGrants),
      });
      pkg.variants.push(newVariant);
    }
  }

  private validateUniqueTitles(pkg: PackageRoot) {
    const titles = new Set<string>();
    for (const v of pkg.variants) {
      if (titles.has(v.title)) {
        throw new DuplicateVariantException(
          `Variant title '${v.title}' is duplicated.`,
        );
      }
      titles.add(v.title);
    }
  }

  private mapGrantDtosToVOs(grants: GrantDto[]): GrantVO[] {
    if (!grants) return [];
    return grants.map(
      (g) =>
        new GrantVO({
          type: g.type,
          key: g.key,
          value: g.value,
          resetCycle: g.resetCycle,
          creditFallback: g.creditFallback,
        }),
    );
  }
}
