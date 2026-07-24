import { UploadedFileDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { UploadedFileCreateInputDto } from './uploaded-file-create.dto';

export class UploadedFileBulkCreateCommand extends Command<UploadedFileDto[]> {
  constructor(
    public readonly files: Array<{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    }>,
    public readonly input: UploadedFileCreateInputDto,
  ) {
    super();
  }
}
