import { UploadedFileDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  type IUploadedFileReadService,
  UPLOADED_FILE_READ_SERVICE,
} from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UploadedFileGetListQuery } from './uploaded-file-get-list.query';

@QueryHandler(UploadedFileGetListQuery)
export class UploadedFileGetListHandler
  implements IQueryHandler<UploadedFileGetListQuery, PaginatedResponseDto<UploadedFileDto>>
{
  constructor(
    @Inject(UPLOADED_FILE_READ_SERVICE) private readonly readService: IUploadedFileReadService,
  ) {}

  async execute(query: UploadedFileGetListQuery): Promise<PaginatedResponseDto<UploadedFileDto>> {
    return this.readService.findAll(query.filters);
  }
}
