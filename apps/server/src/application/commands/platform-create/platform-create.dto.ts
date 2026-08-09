import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EPlatformApiStatus } from '@/core/enums/platform-api-status.enum';

export const PlatformCreateInputSchema = z
  .object({
    name: z.string().min(1).max(100),
    baseUrl: z.string().url(),
    apiStatus: z
      .enum(EPlatformApiStatus)
      .optional()
      .default(EPlatformApiStatus.STABLE),
    icon: z.string().nullable().optional(),
  })
  .strict();

export class PlatformCreateInputDto extends createZodDto(
  PlatformCreateInputSchema,
) {}
