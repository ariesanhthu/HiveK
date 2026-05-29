import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UPLOADED_FILE_REPOSITORY, type IUploadedFileRepository } from '@/core/interfaces/repositories';
import { STORAGE_SERVICE, type IStorageService } from '@/core/interfaces/storage';
import { UploadedFileDeleteCommand } from './uploaded-file-delete.command';
import { UploadService } from '@/application/services';

@CommandHandler(UploadedFileDeleteCommand)
export class UploadedFileDeleteCommandHandler implements ICommandHandler<UploadedFileDeleteCommand, void> {
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly repository: IUploadedFileRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    private readonly uploadService: UploadService,
  ) {}

  async execute(command: UploadedFileDeleteCommand): Promise<void> {
    const { id } = command;

    const file = await this.repository.findById(id);
    if (!file) {
      throw new NotFoundException(`Uploaded file with ID ${id} not found`);
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
