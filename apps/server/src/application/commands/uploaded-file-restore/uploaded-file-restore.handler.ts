import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UploadedFileNotFoundException } from '@/core/exceptions';
import {
  UPLOADED_FILE_REPOSITORY,
  type IUploadedFileRepository,
} from '@/core/interfaces/repositories';
import { UploadedFileRestoreCommand } from './uploaded-file-restore.command';

@CommandHandler(UploadedFileRestoreCommand)
export class UploadedFileRestoreCommandHandler implements ICommandHandler<
  UploadedFileRestoreCommand,
  void
> {
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly repository: IUploadedFileRepository,
  ) {}

  async execute(command: UploadedFileRestoreCommand): Promise<void> {
    const { id } = command;

    const file = await this.repository.findById(id);
    if (!file) {
      throw new UploadedFileNotFoundException(id);
    }

    file.restore();
    await this.repository.save(file);
  }
}
