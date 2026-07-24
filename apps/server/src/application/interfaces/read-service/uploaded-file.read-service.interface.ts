import { UploadedFileDto } from '@/application/dtos';
import { UploadedFileFilterDto } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.dto';
import { IBaseReadService } from './base.read-service.interface';

export const UPLOADED_FILE_READ_SERVICE = Symbol('UPLOADED_FILE_READ_SERVICE');

export type IUploadedFileReadService = IBaseReadService<
  UploadedFileDto,
  UploadedFileFilterDto
>;
