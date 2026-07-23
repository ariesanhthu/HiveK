import { PlatformDto } from '@/application/dtos';
import { PlatformMapper } from '@/application/mappers';
import { PlatformRoot } from '@/core/aggregate-roots';
import { PlatformConflictException } from '@/core/exceptions';
import {
  type IPlatformRepository,
  type IUploadedFileRepository,
  PLATFORM_REPOSITORY,
  UPLOADED_FILE_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlatformCreateCommand } from './platform-create.command';

@CommandHandler(PlatformCreateCommand)
export class PlatformCreateCommandHandler
  implements ICommandHandler<PlatformCreateCommand, PlatformDto>
{
  constructor(
    @Inject(PLATFORM_REPOSITORY) private readonly platformRepository: IPlatformRepository,
  ) {}

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
