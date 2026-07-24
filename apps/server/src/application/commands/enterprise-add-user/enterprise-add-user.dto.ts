import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EnterpriseAddUserInputSchema = z
  .object({
    memberIds: z.array(z.string()),
  })
  .strict();

export class EnterpriseAddUserInputDto extends createZodDto(
  EnterpriseAddUserInputSchema,
) {}
