import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { EnterpriseCreateInputSchema } from '../enterprise-create/enterprise-create.dto';

export const EnterpriseUpdateInputSchema = EnterpriseCreateInputSchema.partial()
  .extend({
    knowledgeBase: z
      .object({
        rawText: z.string().optional(),
        externalLinks: z.array(z.string()).default([]),
      })
      .optional(),
  })
  .strict();

export class EnterpriseUpdateInputDto extends createZodDto(
  EnterpriseUpdateInputSchema,
) {}
