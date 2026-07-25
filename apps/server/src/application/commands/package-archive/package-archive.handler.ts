import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { EVersionStatus } from '@/core/enums';
import { PackageNotFoundException } from '@/core/exceptions';
import { PackageArchiveCommand } from './package-archive.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PackageArchiveCommand)
export class PackageArchiveHandler implements ICommandHandler<PackageArchiveCommand, void> {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PackageArchiveCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Retrieve Target Package
      const targetPackage = await this.packageRepository.findById(input.id);
      if (!targetPackage) {
        throw new PackageNotFoundException(input.id);
      }

      // 2. Validate Status (Strict: ACTIVE -> ARCHIVED)
      if (targetPackage.status !== EVersionStatus.ACTIVE) {
        throw new Error(
          `Cannot archive package with status '${targetPackage.status}'. Only ACTIVE packages can be archived.`
        );
      }

      // 3. Archive Package
      targetPackage.archive();
      await this.packageRepository.save(targetPackage);
    });
  }
}
