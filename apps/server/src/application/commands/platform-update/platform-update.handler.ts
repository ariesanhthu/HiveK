import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PlatformNotFoundException, UploadedFileNotFoundException } from '@/core/exceptions';
import { PLATFORM_REPOSITORY, type IPlatformRepository, UPLOADED_FILE_REPOSITORY, type IUploadedFileRepository } from '@/core/interfaces/repositories';
import { PlatformUpdateCommand } from './platform-update.command';
import { PlatformDto } from '@/application/dtos';
import { PlatformMapper } from '@/application/mappers';

@CommandHandler(PlatformUpdateCommand)
export class UpdatePlatformHandler implements ICommandHandler<PlatformUpdateCommand, PlatformDto> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly uploadedFileRepository: IUploadedFileRepository,
  ) { }

  async execute(command: PlatformUpdateCommand): Promise<PlatformDto> {
    const { id, input } = command;

    const platform = await this.platformRepository.findById(id);
    if (!platform) {
      throw new PlatformNotFoundException(id);
    }

    if (input.name) {
      (platform.props as any).name = input.name.toLowerCase();
    }

    if (input.baseUrl) (platform.props as any).baseUrl = input.baseUrl;
    
    if (input.icon) {
      const fileExists = await this.uploadedFileRepository.findById(input.icon);
      if (!fileExists) {
        throw new UploadedFileNotFoundException(input.icon);
      }
      platform.updateIcon(input.icon);
    }
    
    if (input.apiStatus) platform.updateApiStatus(input.apiStatus);

    await this.platformRepository.save(platform);

    return PlatformMapper.toDto(platform);
  }
}
