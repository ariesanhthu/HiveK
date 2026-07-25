import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { PackageRoot } from '@/core/aggregate-roots';
import { EVersionStatus } from '@/core/enums';
import { PackageCodeAlreadyExistsException } from '@/core/exceptions';
import { PackageMapper } from '@/application/mappers';
import { PackageResponseDto } from '@/application/dtos';
import { PackageCreateCommand } from './package-create.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(PackageCreateCommand)
export class PackageCreateCommandHandler implements ICommandHandler<PackageCreateCommand, PackageResponseDto> {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PackageCreateCommand): Promise<PackageResponseDto> {
    const { input } = command;

    return this.uow.execute(async () => {
      // Check for existing package code
      const existing = await this.packageRepository.findByCode(input.code);
      if (existing.length > 0) {
        throw new PackageCodeAlreadyExistsException(input.code);
      }

      // Create a single PackageRoot with metadata
      const packageEntity = PackageRoot.create({
        code: input.code,
        name: input.name,
        description: input.description,
        type: input.type,
        scope: input.scope,
        enterpriseId: input.enterpriseId || null,
        status: EVersionStatus.DRAFT,
        features: [],
        baseGrants: [],
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        activatedAt: undefined,
      });

      await this.packageRepository.save(packageEntity);

      return PackageMapper.toDto(packageEntity);
    });
  }
}
