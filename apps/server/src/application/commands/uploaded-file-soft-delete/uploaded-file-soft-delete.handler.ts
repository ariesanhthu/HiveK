import { UploadedFileNotFoundException } from '@/core/exceptions';
import {
  type IUploadedFileRepository,
  UPLOADED_FILE_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadedFileSoftDeleteCommand } from './uploaded-file-soft-delete.command';

@CommandHandler(UploadedFileSoftDeleteCommand)
export class UploadedFileSoftDeleteCommandHandler implements
  ICommandHandler<
    UploadedFileSoftDeleteCommand,
    void
  >
{
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY) private readonly repository: IUploadedFileRepository,
  ) {}

  async execute(command: UploadedFileSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const file = await this.repository.findById(id);
    if (!file) {
      throw new UploadedFileNotFoundException(id);
    }

    file.softDelete(deletedBy);
    await this.repository.save(file);
  }
}
