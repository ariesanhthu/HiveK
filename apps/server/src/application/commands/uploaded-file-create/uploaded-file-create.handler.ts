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
import { UploadedFileCreateCommand } from './uploaded-file-create.command';

@CommandHandler(UploadedFileCreateCommand)
export class UploadedFileCreateCommandHandler implements
  ICommandHandler<
    UploadedFileCreateCommand,
    UploadedFileDto
  >
{
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY) private readonly repository: IUploadedFileRepository,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
    private readonly uploadService: UploadService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UploadedFileCreateCommand): Promise<UploadedFileDto> {
    const { file, input } = command;

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

    const targetField = toCamelCase(input.targetField);

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

    await this.repository.save(root);

    // Publish creation event to let target domains link the file asynchronously
    await this.eventBus.publish(
      new UploadedFileCreatedEvent(
        root.id,
        root.targetType,
        root.targetId,
        root.targetField,
      ),
    );

    return UploadedFileMapper.toDto(root);
  }
}
