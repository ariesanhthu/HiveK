import { IBaseRepository } from '../../common/base.repository.interface';
import { UploadedFileRoot } from '../../aggregate-roots/uploaded-file.aggregate';

export const UPLOADED_FILE_REPOSITORY = Symbol('UPLOADED_FILE_REPOSITORY');

export interface IUploadedFileRepository extends IBaseRepository<UploadedFileRoot> {
  findByTarget(targetId: string, targetType: string): Promise<UploadedFileRoot[]>;
}
