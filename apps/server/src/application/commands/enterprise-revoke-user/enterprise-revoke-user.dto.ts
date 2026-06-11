import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseRevokeUserInputSchema = z.object({
  memberIds: z.array(z.string()),
}).strict();

export class EnterpriseRevokeUserInputDto extends createZodDto(EnterpriseRevokeUserInputSchema) {}
