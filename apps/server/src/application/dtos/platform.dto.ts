import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

export const PlatformDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.url(),
  apiStatus: z.enum(PlatformApiStatus),
  iconUrl: z.url(),
});

export class PlatformDto extends createZodDto(PlatformDtoSchema) {}
