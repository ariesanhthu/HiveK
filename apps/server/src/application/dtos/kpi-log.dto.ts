import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const KpiLogSchema = z
  .object({
    id: z.string(),
    timestamp: z.iso.datetime(),
    participantId: z.string(),
    metrics: z
      .object({
        views: z.number(),
        likes: z.number(),
        comments: z.number(),
        shares: z.number(),
      })
      .strict(),
  })
  .strict();

export class KpiLogDto extends createZodDto(KpiLogSchema) {}
