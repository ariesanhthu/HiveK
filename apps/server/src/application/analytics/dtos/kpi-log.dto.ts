import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';

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

export const KpiLogFilterSchema = CursorPaginationRequestSchema.extend({
  participantId: z.string().optional(),
  startTime: z.iso.datetime().optional(),
  endTime: z.iso.datetime().optional(),
});

export class KpiLogFilterDto extends createZodDto(KpiLogFilterSchema) {}
