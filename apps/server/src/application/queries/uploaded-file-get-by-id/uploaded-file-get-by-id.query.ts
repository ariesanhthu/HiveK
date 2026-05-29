import { Query } from '@nestjs/cqrs';
import { UploadedFileDto } from '@/application/dtos';

export class UploadedFileGetByIdQuery extends Query<UploadedFileDto> {
  constructor(public readonly id: string) {
    super();
  }
}
