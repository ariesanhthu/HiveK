import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const EnterpriseVerifySchema = z
  .object({
    enterpriseId: z.string(),
  })
  .strict();

export class EnterpriseVerifyDto extends createZodDto(EnterpriseVerifySchema) {}
