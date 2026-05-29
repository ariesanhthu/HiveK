import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UPLOADED_FILE_REPOSITORY, type IUploadedFileRepository } from '@/core/interfaces/repositories';
import { UploadedFileSoftDeleteCommand } from './uploaded-file-soft-delete.command';

@CommandHandler(UploadedFileSoftDeleteCommand)
export class UploadedFileSoftDeleteCommandHandler implements ICommandHandler<UploadedFileSoftDeleteCommand, void> {
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly repository: IUploadedFileRepository,
  ) {}

  async execute(command: UploadedFileSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const file = await this.repository.findById(id);
    if (!file) {
      throw new NotFoundException(`Uploaded file with ID ${id} not found`);
    }

    file.softDelete(deletedBy);
    await this.repository.save(file);
  }
}
