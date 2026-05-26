import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

export const PlatformUpdateInputDtoSchema = z.object({
  name: z.string().optional(),
  baseUrl: z.url().optional(),
  apiStatus: z.enum(PlatformApiStatus).optional(),
  iconUrl: z.url().optional(),
});

export class PlatformUpdateInputDto extends createZodDto(PlatformUpdateInputDtoSchema) {}
