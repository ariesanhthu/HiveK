import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SubscriptionUpdateSchema = z.object({
  enterpriseId: z.string().min(1),
  billId: z.string().min(1),
}).strict();

export class SubscriptionUpdateInputDto extends createZodDto(SubscriptionUpdateSchema) {}
