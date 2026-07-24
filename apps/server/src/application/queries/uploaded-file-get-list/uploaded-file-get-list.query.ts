import { UploadedFileDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';
import { UploadedFileFilterDto } from './uploaded-file-get-list.dto';

export class UploadedFileGetListQuery extends Query<
  PaginatedResponseDto<UploadedFileDto>
> {
  constructor(public readonly filters: UploadedFileFilterDto) {
    super();
  }
}
