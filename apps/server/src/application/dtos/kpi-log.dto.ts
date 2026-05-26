import { z } from 'zod';

export const KpiLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  participantId: z.string(),
  metrics: z.object({
    views: z.number(),
    likes: z.number(),
    comments: z.number(),
    shares: z.number(),
  }),
});

export type KpiLogDto = z.infer<typeof KpiLogSchema>;
