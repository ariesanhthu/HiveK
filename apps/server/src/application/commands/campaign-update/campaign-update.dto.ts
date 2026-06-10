import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CampaignUpdateInputSchema = z.object({
  budget: z.number().nonnegative().optional(),
  financialTarget: z.record(z.string(), z.any()).optional(),
  description: z.string().min(1).max(2000).optional(),
  platformTarget: z.array(z.object({
    platformId: z.string().min(1),
    minFollowers: z.number().nonnegative().optional(),
    maxFollowers: z.number().nonnegative().optional(),
    note: z.string().max(500).optional(),
    others: z.record(z.string(), z.any()).optional(),
  })).optional(),
}).strict();


export class CampaignUpdateInputDto extends createZodDto(CampaignUpdateInputSchema) {}
