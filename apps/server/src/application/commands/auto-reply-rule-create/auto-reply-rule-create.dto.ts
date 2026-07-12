import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AutoReplyRuleCreateInputSchema = z.object({
  socialPageId: z.string().min(1),
  name: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  replyContent: z.string().min(1),
}).strict();

export class AutoReplyRuleCreateInputDto extends createZodDto(AutoReplyRuleCreateInputSchema) {}
