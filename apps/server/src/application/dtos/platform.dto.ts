import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

export const PlatformDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.url(),
  apiStatus: z.enum(PlatformApiStatus),
  icon: z.string(),
});

import { UploadedFileDto } from './uploaded-file.dto';

export class PlatformDto extends createZodDto(PlatformDtoSchema) {}

export type PlatformDetailDto = Omit<PlatformDto, 'icon'> & {
  icon: UploadedFileDto | null;
};

