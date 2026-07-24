import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const NotificationRestoreDtoSchema = z
  .object({
    ids: z.array(z.string()).min(1),
  })
  .strict();

export class NotificationRestoreDto extends createZodDto(
  NotificationRestoreDtoSchema,
) {}
