import { UploadService } from '@/application/services';
import { UploadedFileNotFoundException } from '@/core/exceptions';
import {
  type IUploadedFileRepository,
  UPLOADED_FILE_REPOSITORY,
} from '@/core/interfaces/repositories';
import { type IStorageService, STORAGE_SERVICE } from '@/core/interfaces/storage';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadedFileDeleteCommand } from './uploaded-file-delete.command';

@CommandHandler(UploadedFileDeleteCommand)
export class UploadedFileDeleteCommandHandler implements
  ICommandHandler<
    UploadedFileDeleteCommand,
    void
  >
{
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY) private readonly repository: IUploadedFileRepository,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
    private readonly uploadService: UploadService,
  ) {}

  async execute(command: UploadedFileDeleteCommand): Promise<void> {
    const { id } = command;

    const file = await this.repository.findById(id);
    if (!file) {
      throw new UploadedFileNotFoundException(id);
    }

    // Determine resource type for deletion from format
    const resourceType = this.uploadService.getResourceType(file.format);

    // Physically delete from storage
    if (file.publicId) {
      await this.storageService.delete(file.publicId, { resourceType });
    }

    // Delete from DB
    await this.repository.delete(id);
  }
}
