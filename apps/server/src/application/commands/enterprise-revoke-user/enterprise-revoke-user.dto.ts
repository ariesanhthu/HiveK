import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseRevokeUserInputSchema = z.object({
  userId: z.string(),
  enterpriseId: z.string(),
});

export class EnterpriseRevokeUserInputDto extends createZodDto(EnterpriseRevokeUserInputSchema) {}
