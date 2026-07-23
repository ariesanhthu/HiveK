import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const NotificationHardDeleteDtoSchema = z.object({
  ids: z.array(z.string()).min(1),
}).strict();

export class NotificationHardDeleteDto extends createZodDto(NotificationHardDeleteDtoSchema) {}
