import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AutoReplyRuleUpdateInputSchema = z
  .object({
    name: z.string().min(1).optional(),
    keywords: z.array(z.string()).optional(),
    replyContent: z.string().min(1).optional(),
    isEnabled: z.boolean().optional(),
  })
  .strict();

export class AutoReplyRuleUpdateInputDto extends createZodDto(
  AutoReplyRuleUpdateInputSchema,
) {}
