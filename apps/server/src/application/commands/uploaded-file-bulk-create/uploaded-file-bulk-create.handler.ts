import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { UploadedFileBulkCreateCommand } from './uploaded-file-bulk-create.command';
import { UploadedFileCreateCommand } from '../uploaded-file-create/uploaded-file-create.command';
import { UploadedFileDto } from '@/application/dtos';

import { BadRequestException } from '@nestjs/common';

@CommandHandler(UploadedFileBulkCreateCommand)
export class UploadedFileBulkCreateCommandHandler implements ICommandHandler<UploadedFileBulkCreateCommand, UploadedFileDto[]> {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: UploadedFileBulkCreateCommand): Promise<UploadedFileDto[]> {
    const { files, input } = command;

    if (files.length > 10) {
      throw new BadRequestException('Cannot upload more than 10 files at a time');
    }

    const createPromises = files.map((file) =>
      this.commandBus.execute<UploadedFileCreateCommand, UploadedFileDto>(
        new UploadedFileCreateCommand(file, input),
      ),
    );

    return Promise.all(createPromises);
  }
}
