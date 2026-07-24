import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const NotificationSoftDeleteDtoSchema = z
  .object({
    ids: z.array(z.string()).min(1),
  })
  .strict();

export class NotificationSoftDeleteDto extends createZodDto(
  NotificationSoftDeleteDtoSchema,
) {}
