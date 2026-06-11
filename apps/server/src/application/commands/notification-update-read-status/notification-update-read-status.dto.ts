import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const NotificationUpdateReadStatusDtoSchema = z.object({
  ids: z.array(z.string()).optional(), // Optional: if empty/null, applies to all
  isRead: z.boolean().default(true),
}).strict();

export class NotificationUpdateReadStatusDto extends createZodDto(NotificationUpdateReadStatusDtoSchema) {}
