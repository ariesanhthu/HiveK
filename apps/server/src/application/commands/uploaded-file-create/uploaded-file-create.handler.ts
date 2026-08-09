import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  UPLOADED_FILE_REPOSITORY,
  type IUploadedFileRepository,
} from '@/core/interfaces/repositories';
import {
  STORAGE_SERVICE,
  type IStorageService,
} from '@/core/interfaces/storage';
import { UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { EVENT_SERVICE, type IEventService } from '@/application/interfaces';
import { FileLinkerService } from '@/application/services';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { UploadedFileCreateCommand } from './uploaded-file-create.command';
import { UploadedFileDto } from '@/application/dtos';
import { UploadedFileMapper } from '@/application/mappers';
import { UploadService } from '@/application/services';
import { toCamelCase, buildFilename } from '@/shared/utils/string.util';

export function resolveFormat(
  storageFormat: string | undefined,
  mimetype: string,
): string {
  if (storageFormat) return storageFormat;
  const sub = mimetype.split('/')[1];
  return sub ?? 'bin';
}

@CommandHandler(UploadedFileCreateCommand)
export class UploadedFileCreateCommandHandler implements ICommandHandler<
  UploadedFileCreateCommand,
  UploadedFileDto
> {
  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly repository: IUploadedFileRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    private readonly uploadService: UploadService,
    private readonly linker: FileLinkerService,
  ) {}

  async execute(command: UploadedFileCreateCommand): Promise<UploadedFileDto> {
    const { file, input } = command;

    // ── Phase 1: Pre-transaction (Compression + Storage Upload) ──────────────
    const { buffer, size } = await this.uploadService.processAndValidateFile(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    const uploadResult = await this.storageService.upload(buffer, {
      folder: input.targetType.toLowerCase(),
      filename: buildFilename(file.originalname),
    });

    // ── Phase 2: Atomic DB transaction (Save File + Link to Target) ──────────
    const targetField = toCamelCase(input.targetField);
    let root: UploadedFileRoot;

    try {
      root = await this.uow.execute(async () => {
        const fileRoot = UploadedFileRoot.create({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          size: uploadResult.size ?? size,
          format: resolveFormat(uploadResult.format, file.mimetype),
          title: input.title,
          targetType: input.targetType,
          targetId: input.targetId,
          targetField,
        });

        await this.repository.save(fileRoot);
        await this.linker.link(fileRoot);
        return fileRoot;
      });
    } catch (error) {
      // ── Compensation: delete from storage on DB transaction failure ────────
      await this.storageService.delete(uploadResult.publicId, {
        resourceType: this.uploadService.getResourceType(file.mimetype),
      });
      throw error;
    }

    // ── Phase 3: Post-commit Side Effects ────────────────────────────────────
    await this.eventService.publishEvents(root);

    return UploadedFileMapper.toDto(root);
  }
}
