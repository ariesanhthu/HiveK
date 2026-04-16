import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces';
import { UpdatePlatformCommand } from '../update-platform.command';

import { PlatformDto } from '../../dtos';
import { PlatformMapper } from '../../mappers/platform.mapper';

@CommandHandler(UpdatePlatformCommand)
export class UpdatePlatformHandler implements ICommandHandler<UpdatePlatformCommand, PlatformDto> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) {}

  async execute(command: UpdatePlatformCommand): Promise<PlatformDto> {
    const { id, input } = command;

    const platform = await this.platformRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Platform with ID ${id} not found`);
    }

    if (input.name) {
      (platform.props as any).name = input.name.toLowerCase();
    }
    
    if (input.baseUrl) (platform.props as any).baseUrl = input.baseUrl;
    if (input.iconUrl) platform.updateIconUrl(input.iconUrl);
    if (input.apiStatus) platform.updateApiStatus(input.apiStatus);

    await this.platformRepository.save(platform);

    return PlatformMapper.toDto(platform);
  }
}
