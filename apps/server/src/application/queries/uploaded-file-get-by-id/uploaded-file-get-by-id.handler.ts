import { UploadedFileDto } from '@/application/dtos';
import {
  type IUploadedFileReadService,
  UPLOADED_FILE_READ_SERVICE,
} from '@/application/interfaces';
import { UploadedFileNotFoundException } from '@/core/exceptions';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UploadedFileGetByIdQuery } from './uploaded-file-get-by-id.query';

@QueryHandler(UploadedFileGetByIdQuery)
export class UploadedFileGetByIdHandler implements
  IQueryHandler<
    UploadedFileGetByIdQuery,
    UploadedFileDto
  >
{
  constructor(
    @Inject(UPLOADED_FILE_READ_SERVICE) private readonly readService: IUploadedFileReadService,
  ) {}

  async execute(query: UploadedFileGetByIdQuery): Promise<UploadedFileDto> {
    const file = await this.readService.findById(query.id);
    if (!file) {
      throw new UploadedFileNotFoundException(query.id);
    }
    return file;
  }
}
