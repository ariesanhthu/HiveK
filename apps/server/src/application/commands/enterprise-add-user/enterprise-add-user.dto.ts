import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseAddUserInputSchema = z.object({
  memberIds: z.array(z.string()),
}).strict();

export class EnterpriseAddUserInputDto extends createZodDto(EnterpriseAddUserInputSchema) {}
