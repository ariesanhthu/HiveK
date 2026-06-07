import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const NotificationHardDeleteDtoSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export class NotificationHardDeleteDto extends createZodDto(NotificationHardDeleteDtoSchema) {}
