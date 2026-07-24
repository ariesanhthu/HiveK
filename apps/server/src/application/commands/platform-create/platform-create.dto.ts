import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PlatformCreateInputSchema = z
  .object({
    name: z.string().min(1).max(100),
    baseUrl: z.string().url(),
    apiStatus: z
      .enum(PlatformApiStatus)
      .optional()
      .default(PlatformApiStatus.STABLE),
    icon: z.string().nullable().optional(),
  })
  .strict();

export class PlatformCreateInputDto extends createZodDto(
  PlatformCreateInputSchema,
) {}
