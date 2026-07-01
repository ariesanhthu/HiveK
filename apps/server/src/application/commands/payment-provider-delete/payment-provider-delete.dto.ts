import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentProviderDeleteSchema = z.object({
  id: z.string().min(1),
  deletedBy: z.string().min(1),
}).strict();

export class PaymentProviderDeleteInputDto extends createZodDto(PaymentProviderDeleteSchema) {}
