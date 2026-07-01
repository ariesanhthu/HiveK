import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentProviderRestoreSchema = z.object({
  id: z.string().min(1),
}).strict();

export class PaymentProviderRestoreInputDto extends createZodDto(PaymentProviderRestoreSchema) {}
