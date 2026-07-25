import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPlatformApiStatus } from '@/core/enums/platform-api-status.enum';
import { UploadedFileDto, UploadedFileDtoSchema } from './uploaded-file.dto';

export const PlatformDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string(),
  apiStatus: z.enum(EPlatformApiStatus),
  icon: z.string().nullable(),
}).strict();

export class PlatformDto extends createZodDto(PlatformDtoSchema) { }

export const PlatformDetailDtoSchema = PlatformDtoSchema.extend({
  icon: UploadedFileDtoSchema.nullable(),
});

export class PlatformDetailDto extends createZodDto(PlatformDetailDtoSchema) { }

