import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UploadedFileNotFoundException } from '@/core/exceptions';
import {
  UPLOADED_FILE_READ_SERVICE,
  type IUploadedFileReadService,
} from '@/application/interfaces';
import { UploadedFileDto } from '@/application/dtos';
import { UploadedFileGetByIdQuery } from './uploaded-file-get-by-id.query';

@QueryHandler(UploadedFileGetByIdQuery)
export class UploadedFileGetByIdHandler implements IQueryHandler<
  UploadedFileGetByIdQuery,
  UploadedFileDto
> {
  constructor(
    @Inject(UPLOADED_FILE_READ_SERVICE)
    private readonly readService: IUploadedFileReadService,
  ) {}

  async execute(query: UploadedFileGetByIdQuery): Promise<UploadedFileDto> {
    const file = await this.readService.findById(query.id);
    if (!file) {
      throw new UploadedFileNotFoundException(query.id);
    }
    return file;
  }
}
