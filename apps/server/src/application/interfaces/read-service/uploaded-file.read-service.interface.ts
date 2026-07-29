import { IBaseReadService } from './base.read-service.interface';
import { UploadedFileDto } from '@/application/dtos';
import { UploadedFileFilterDto } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.dto';

export const UPLOADED_FILE_READ_SERVICE = Symbol('UPLOADED_FILE_READ_SERVICE');

export interface IUploadedFileReadService extends IBaseReadService<
  UploadedFileDto,
  UploadedFileFilterDto
> {}
