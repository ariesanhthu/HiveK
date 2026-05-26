import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';

export const KpiLogFilterSchema = CursorPaginationRequestSchema.extend({
  participantId: z.string().optional(),
  startTime: z.iso.datetime().optional(),
  endTime: z.iso.datetime().optional(),
});

export class KpiLogFilterDto extends createZodDto(KpiLogFilterSchema) {}
