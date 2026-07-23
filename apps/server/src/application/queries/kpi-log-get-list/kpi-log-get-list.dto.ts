import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const KpiLogFilterSchema = CursorPaginationRequestSchema.extend({
  participantId: z.string().optional(),
  outputId: z.string().optional(),
  startTime: z.iso.datetime().optional(),
  endTime: z.iso.datetime().optional(),
});

export class KpiLogFilterDto extends createZodDto(KpiLogFilterSchema) {}
