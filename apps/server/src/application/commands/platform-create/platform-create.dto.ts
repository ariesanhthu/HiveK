import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

export const PlatformCreateInputSchema = z.object({
  name: z.string().min(1).max(100),
  baseUrl: z.string().url(),
  apiStatus: z.nativeEnum(PlatformApiStatus).optional().default(PlatformApiStatus.STABLE),
  icon: z.string().nullable().optional(),
});

export class PlatformCreateInputDto extends createZodDto(PlatformCreateInputSchema) {}
