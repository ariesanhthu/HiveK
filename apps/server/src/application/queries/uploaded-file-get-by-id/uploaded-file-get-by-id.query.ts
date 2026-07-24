import { UploadedFileDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class UploadedFileGetByIdQuery extends Query<UploadedFileDto> {
  constructor(public readonly id: string) {
    super();
  }
}
