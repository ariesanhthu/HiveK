import { Command } from '@nestjs/cqrs';
import { UploadedFileCreateInputDto } from './uploaded-file-create.dto';
import { UploadedFileDto } from '@/application/dtos';

export class UploadedFileCreateCommand extends Command<UploadedFileDto> {
  constructor(
    public readonly file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
    public readonly input: UploadedFileCreateInputDto,
  ) {
    super();
  }
}
