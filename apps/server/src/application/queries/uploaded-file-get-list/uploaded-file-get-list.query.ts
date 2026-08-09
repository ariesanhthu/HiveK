import { Query } from '@nestjs/cqrs';
import { UploadedFileFilterDto } from './uploaded-file-get-list.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { UploadedFileDto } from '@/application/dtos';

export class UploadedFileGetListQuery extends Query<
  PaginatedResponseDto<UploadedFileDto>
> {
  constructor(public readonly filters: UploadedFileFilterDto) {
    super();
  }
}
