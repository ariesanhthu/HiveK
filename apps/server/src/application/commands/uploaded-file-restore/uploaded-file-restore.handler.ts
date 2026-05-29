import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UPLOADED_FILE_REPOSITORY, type IUploadedFileRepository } from '@/core/interfaces/repositories';
import { UploadedFileRestoreCommand } from './uploaded-file-restore.command';

@CommandHandler(UploadedFileRestoreCommand)
export class UploadedFileRestoreCommandHandler implements ICommandHandler<UploadedFileRestoreCommand, void> {
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly repository: IUploadedFileRepository,
  ) {}

  async execute(command: UploadedFileRestoreCommand): Promise<void> {
    const { id } = command;

    const file = await this.repository.findById(id);
    if (!file) {
      throw new NotFoundException(`Uploaded file with ID ${id} not found`);
    }

    file.restore();
    await this.repository.save(file);
  }
}
