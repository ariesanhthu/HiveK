import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EnterpriseVerifySchema = z
  .object({
    enterpriseId: z.string(),
  })
  .strict();

export class EnterpriseVerifyDto extends createZodDto(EnterpriseVerifySchema) {}
