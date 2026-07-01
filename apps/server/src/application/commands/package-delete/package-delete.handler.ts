import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { SUBSCRIPTION_REPOSITORY, type ISubscriptionRepository } from '@/core/interfaces/repositories';
import { EVersionStatus } from '@/core/enums';
import { PackageNotFoundException, PackageInUseException } from '@/core/exceptions';
import { PackageDeleteCommand } from './package-delete.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PackageDeleteCommand)
export class PackageDeleteHandler implements ICommandHandler<PackageDeleteCommand, void> {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PackageDeleteCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Retrieve Target Package
      const pkg = await this.packageRepository.findById(input.id);
      if (!pkg) {
        throw new PackageNotFoundException(input.id);
      }

      // 2. Validate Status
      if (pkg.status !== EVersionStatus.DRAFT && pkg.status !== EVersionStatus.ARCHIVED) {
        throw new Error(
          `Cannot delete package with status '${pkg.status}'. Only DRAFT or ARCHIVED packages can be deleted.`
        );
      }

      // 3. Check References (If ARCHIVED)
      if (pkg.status === EVersionStatus.ARCHIVED) {
        const isUsed = await this.subscriptionRepository.existsByPackageId(pkg.id);
        if (isUsed) {
          throw new PackageInUseException(pkg.id);
        }
      }

      // 4. Delete
      await this.packageRepository.delete(pkg.id);
    });
  }
}
