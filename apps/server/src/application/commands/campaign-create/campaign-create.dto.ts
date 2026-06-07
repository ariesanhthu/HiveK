import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

export const CampaignCreateInputSchema = z.object({
  ownerId: z.string().optional(), // usually filled by controller
  enterpriseId: z.string().min(1), // Required
  budget: z.number().nonnegative(),
  financialTarget: z.record(z.string(), z.any()),
  description: z.string().min(1).max(2000),
  platformTarget: z.array(z.object({
    platformId: z.string().min(1),
    minFollowers: z.number().nonnegative().optional(),
    maxFollowers: z.number().nonnegative().optional(),
    note: z.string().max(500).optional(),
    others: z.record(z.string(), z.any()).optional(),
  })).optional().default([]),
  status: z.nativeEnum(ECampaignStatus).optional(),
  collaboratorIds: z.array(z.string()).optional(),
});

export class CampaignCreateInputDto extends createZodDto(CampaignCreateInputSchema) {}
