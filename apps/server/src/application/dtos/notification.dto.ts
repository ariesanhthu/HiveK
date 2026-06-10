import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { NotificationType, TargetType } from '@/core/enums';

import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';

export const NotificationDtoSchema = z.object({
  id: z.string(), // This is the user_notifications._id, used by FE to operate (mark as read / delete)
  notificationId: z.string(),
  type: z.enum(NotificationType),
  title: z.string(),
  content: z.string(),
  targetType: z.enum(TargetType).nullable().optional(),
  targetId: z.string().nullable().optional(),
  isRead: z.boolean(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export class NotificationDto extends createZodDto(NotificationDtoSchema) {}

export const NotificationFilterDtoSchema = CursorPaginationRequestSchema.extend({
  recipientId: z.string().optional(),
  isRead: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional()
  ),
});

export class NotificationFilterDto extends createZodDto(NotificationFilterDtoSchema) {}
