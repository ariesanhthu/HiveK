import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { EVersionStatus } from '@/core/enums';
import { PackageNotFoundException } from '@/core/exceptions';
import { PackageResponseDto } from '@/application/dtos';
import { PackageMapper } from '@/application/mappers';
import { PackagePublishCommand } from './package-publish.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PackagePublishCommand)
export class PackagePublishHandler implements ICommandHandler<PackagePublishCommand, PackageResponseDto> {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PackagePublishCommand): Promise<PackageResponseDto> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Retrieve Target Package
      const target = await this.packageRepository.findById(input.id);
      if (!target) {
        throw new PackageNotFoundException(input.id);
      }

      // 2. Validation: Status must be DRAFT or ARCHIVED
      if (
        target.status !== EVersionStatus.DRAFT &&
        target.status !== EVersionStatus.ARCHIVED
      ) {
        throw new Error(
          `Cannot publish package with status '${target.status}'. Only DRAFT or ARCHIVED packages can be published.`
        );
      }

      // 3. Validation: Variants not empty
      if (target.variants.length === 0) {
        throw new Error(
          `Cannot publish package '${target.code}' without variants.`
        );
      }

      // 4. Archive Current Active Version (if exists)
      const existingVersions = await this.packageRepository.findByCode(target.code);
      const active = existingVersions.find((p) => p.status === EVersionStatus.ACTIVE);

      if (active && active.id !== target.id) {
        active.archive();
        await this.packageRepository.save(active);
      }

      // 5. Activate Target Version
      target.activate();
      await this.packageRepository.save(target);

      return PackageMapper.toDto(target);
    });
  }
}
