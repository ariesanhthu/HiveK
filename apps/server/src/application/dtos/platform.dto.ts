import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPlatformApiStatus } from '@/core/enums/platform-api-status.enum';
import { UploadedFileDto } from './uploaded-file.dto';

export const PlatformDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string(),
  apiStatus: z.enum(EPlatformApiStatus),
  icon: z.string().nullable(),
}).strict();

export class PlatformDto extends createZodDto(PlatformDtoSchema) { }

export type PlatformDetailDto = Omit<PlatformDto, 'icon'> & {
  icon: UploadedFileDto | null;
};
