import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SubscriptionUpdateSchema = z.object({
  userId: z.string().min(1),
  billId: z.string().min(1),
  removedAddonIds: z.array(z.string().min(1)).optional(),
}).strict();

export class SubscriptionUpdateInputDto extends createZodDto(SubscriptionUpdateSchema) {}
