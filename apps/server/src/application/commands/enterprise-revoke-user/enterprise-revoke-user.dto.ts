import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EnterpriseRevokeUserInputSchema = z
  .object({
    memberIds: z.array(z.string()),
  })
  .strict();

export class EnterpriseRevokeUserInputDto extends createZodDto(
  EnterpriseRevokeUserInputSchema,
) {}
