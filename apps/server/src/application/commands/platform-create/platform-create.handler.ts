import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { PLATFORM_REPOSITORY, type IPlatformRepository, UPLOADED_FILE_REPOSITORY, type IUploadedFileRepository } from '@/core/interfaces/repositories';
import { PlatformRoot } from '@/core/aggregate-roots';
import { PlatformCreateCommand } from './platform-create.command';
import { PlatformDto } from '@/application/dtos';
import { PlatformMapper } from '@/application/mappers';

@CommandHandler(PlatformCreateCommand)
export class CreatePlatformHandler implements ICommandHandler<PlatformCreateCommand, PlatformDto> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly uploadedFileRepository: IUploadedFileRepository,
  ) { }

  async execute(command: PlatformCreateCommand): Promise<PlatformDto> {
    const { input } = command;

    const existingPlatform = await this.platformRepository.findByName(input.name);
    if (existingPlatform) {
      throw new ConflictException(`Platform with name ${input.name} already exists`);
    }

    const fileExists = await this.uploadedFileRepository.findById(input.icon);
    if (!fileExists) {
      throw new NotFoundException(`Icon file with ID ${input.icon} not found`);
    }

    const platform = PlatformRoot.create({
      name: input.name,
      baseUrl: input.baseUrl,
      apiStatus: input.apiStatus,
      icon: input.icon,
    });

    await this.platformRepository.save(platform);

    return PlatformMapper.toDto(platform);
  }
}
