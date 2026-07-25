import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AutoReplyRuleDtoSchema = z.object({
  id: z.string(),
  enterpriseId: z.string(),
  socialPageId: z.string(),
  name: z.string(),
  isEnabled: z.boolean(),
  keywords: z.array(z.string()),
  replyContent: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export class AutoReplyRuleDto extends createZodDto(AutoReplyRuleDtoSchema) {}

