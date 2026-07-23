import { UploadedFileDto } from '@/application/dtos';
import { UploadedFileCreatedEvent } from '@/application/events';
import { UploadedFileMapper } from '@/application/mappers';
import { UploadService } from '@/application/services';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import {
  type IUploadedFileRepository,
  UPLOADED_FILE_REPOSITORY,
} from '@/core/interfaces/repositories';
import { type IStorageService, STORAGE_SERVICE } from '@/core/interfaces/storage';
import { toCamelCase } from '@/shared/utils/string.util';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UploadedFileBulkCreateCommand } from './uploaded-file-bulk-create.command';

@CommandHandler(UploadedFileBulkCreateCommand)
export class UploadedFileBulkCreateCommandHandler
  implements ICommandHandler<UploadedFileBulkCreateCommand, UploadedFileDto[]>
{
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY) private readonly repository: IUploadedFileRepository,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
    private readonly uploadService: UploadService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UploadedFileBulkCreateCommand): Promise<UploadedFileDto[]> {
    const { files, input } = command;
    const targetField = toCamelCase(input.targetField);

    const uploadPromises = files.map(async (file) => {
      // Validate size and auto-compress if image exceeds 2MB
      const { buffer, size } = await this.uploadService.processAndValidateFile(
        file.buffer,
        file.mimetype,
        file.originalname,
      );

      // Upload to storage service
      const uploadResult = await this.storageService.upload(buffer, {
        folder: input.targetType.toLowerCase(),
        filename: file.originalname.split('.')[0] + '-' + Date.now(),
      });

      const root = UploadedFileRoot.create({
        url: uploadResult.url,
        publicId: uploadResult.publicId || '',
        size: uploadResult.size || size,
        format: uploadResult.format || file.mimetype.split('/')[1] || 'bin',
        title: input.title,
        targetType: input.targetType,
        targetId: input.targetId,
        targetField,
      });

      return root;
    });

    const roots = await Promise.all(uploadPromises);

    // Save all to database and publish event
    for (const root of roots) {
      await this.repository.save(root);

      await this.eventBus.publish(
        new UploadedFileCreatedEvent(
          root.id!,
          root.targetType,
          root.targetId,
          root.targetField,
        ),
      );
    }

    return roots.map((root) => UploadedFileMapper.toDto(root));
  }
}
