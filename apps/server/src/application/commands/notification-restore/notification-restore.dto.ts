import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const NotificationRestoreDtoSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export class NotificationRestoreDto extends createZodDto(NotificationRestoreDtoSchema) {}
