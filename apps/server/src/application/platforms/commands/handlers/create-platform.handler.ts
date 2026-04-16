import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces';
import { PlatformRoot } from '@/core/aggregate-roots';
import { CreatePlatformCommand } from '../create-platform.command';
import { PlatformDto } from '../../dtos';
import { PlatformMapper } from '../../mappers/platform.mapper';

@CommandHandler(CreatePlatformCommand)
export class CreatePlatformHandler implements ICommandHandler<CreatePlatformCommand, PlatformDto> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) {}

  async execute(command: CreatePlatformCommand): Promise<PlatformDto> {
    const { input } = command;

    const existingPlatform = await this.platformRepository.findByName(input.name);
    if (existingPlatform) {
      throw new Error(`Platform with name ${input.name} already exists`);
    }

    const platform = PlatformRoot.create({
      name: input.name,
      baseUrl: input.baseUrl,
      apiStatus: input.apiStatus,
      iconUrl: input.iconUrl,
    });

    await this.platformRepository.save(platform);

    return PlatformMapper.toDto(platform);
  }
}
