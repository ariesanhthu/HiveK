import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PlatformConflictException } from '@/core/exceptions';
import { PLATFORM_REPOSITORY, type IPlatformRepository, UPLOADED_FILE_REPOSITORY, type IUploadedFileRepository } from '@/core/interfaces/repositories';
import { PlatformRoot } from '@/core/aggregate-roots';
import { PlatformCreateCommand } from './platform-create.command';
import { PlatformDto } from '@/application/dtos';
import { PlatformMapper } from '@/application/mappers';

@CommandHandler(PlatformCreateCommand)
export class PlatformCreateCommandHandler implements ICommandHandler<PlatformCreateCommand, PlatformDto> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) { }

  async execute(command: PlatformCreateCommand): Promise<PlatformDto> {
    const { input } = command;

    const existingPlatform = await this.platformRepository.findByName(input.name);
    if (existingPlatform) {
      throw new PlatformConflictException(`Platform with name ${input.name} already exists`);
    }

    const platform = PlatformRoot.create({
      name: input.name,
      baseUrl: input.baseUrl,
      apiStatus: input.apiStatus,
    });

    await this.platformRepository.save(platform);

    return PlatformMapper.toDto(platform);
  }
}
