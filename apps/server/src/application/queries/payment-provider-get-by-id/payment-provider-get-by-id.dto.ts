import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaymentProviderGetByIdSchema = z.object({
  id: z.string().min(1),
}).strict();

export class PaymentProviderGetByIdInputDto extends createZodDto(PaymentProviderGetByIdSchema) {}
