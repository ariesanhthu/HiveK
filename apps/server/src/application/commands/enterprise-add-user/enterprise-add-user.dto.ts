import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseAddUserInputSchema = z.object({
  userId: z.string(),
  enterpriseId: z.string(),
});

export class EnterpriseAddUserInputDto extends createZodDto(EnterpriseAddUserInputSchema) {}
