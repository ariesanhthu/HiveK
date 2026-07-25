import { UploadedFileDto } from '../dtos';
import { UploadedFileRoot } from '@/core/aggregate-roots';

export class UploadedFileMapper {
  static toDto(root: UploadedFileRoot): UploadedFileDto {
    return {
      id: root.id!,
      url: root.url,
      publicId: root.publicId,
      size: root.size,
      format: root.format,
      title: root.title,
      targetType: root.targetType,
      targetId: root.targetId,
      targetField: root.targetField,
      createdAt: root.createdAt.toISOString(),
      updatedAt: root.updatedAt.toISOString(),
    };
  }

  static toListDto(roots: UploadedFileRoot[]): UploadedFileDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
