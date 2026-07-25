import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseRevokeMemberInputSchema = z.object({
  userId: z.string().min(1),
}).strict();

export class EnterpriseRevokeMemberInputDto extends createZodDto(EnterpriseRevokeMemberInputSchema) {}
