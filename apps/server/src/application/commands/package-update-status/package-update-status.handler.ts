import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PACKAGE_REPOSITORY,
  type IPackageRepository,
} from '@/core/interfaces/repositories';
import { PackageRoot } from '@/core/aggregate-roots';
import { EVersionStatus } from '@/core/enums';
import { PackageNotFoundException } from '@/core/exceptions';
import { PackageResponseDto } from '@/application/dtos';
import { PackageMapper } from '@/application/mappers';
import { PackageUpdateStatusCommand } from './package-update-status.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PackageUpdateStatusCommand)
export class PackageUpdateStatusHandler implements ICommandHandler<
  PackageUpdateStatusCommand,
  PackageResponseDto
> {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: PackageUpdateStatusCommand,
  ): Promise<PackageResponseDto> {
    const { id, input } = command;

    return this.uow.execute(async () => {
      const target = await this.packageRepository.findById(id);
      if (!target) {
        throw new PackageNotFoundException(id);
      }

      if (input.status === EVersionStatus.ACTIVE) {
        return this.handlePublish(target);
      }

      // EVersionStatus.ARCHIVED
      this.handleArchive(target);
      await this.packageRepository.save(target);

      return PackageMapper.toDto(target);
    });
  }

  private async handlePublish(
    target: PackageRoot,
  ): Promise<PackageResponseDto> {
    // Validation: Status must be DRAFT or ARCHIVED
    if (
      target.status !== EVersionStatus.DRAFT &&
      target.status !== EVersionStatus.ARCHIVED
    ) {
      throw new Error(
        `Cannot publish package with status '${target.status}'. Only DRAFT or ARCHIVED packages can be published.`,
      );
    }

    // Validation: Variants not empty
    if (target.variants.length === 0) {
      throw new Error(
        `Cannot publish package '${target.code}' without variants.`,
      );
    }

    // Archive current active version (if exists)
    const existingVersions = await this.packageRepository.findByCode(
      target.code,
    );
    const active = existingVersions.find(
      (p) => p.status === EVersionStatus.ACTIVE,
    );

    if (active && active.id !== target.id) {
      active.archive();
      await this.packageRepository.save(active);
    }

    // Activate target version
    target.activate();
    await this.packageRepository.save(target);

    return PackageMapper.toDto(target);
  }

  private handleArchive(target: PackageRoot): void {
    // Validate Status (Strict: ACTIVE -> ARCHIVED)
    if (target.status !== EVersionStatus.ACTIVE) {
      throw new Error(
        `Cannot archive package with status '${target.status}'. Only ACTIVE packages can be archived.`,
      );
    }

    target.archive();
  }
}
