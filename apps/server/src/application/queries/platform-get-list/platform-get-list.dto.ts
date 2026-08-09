import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { EPlatformApiStatus } from '@/core/enums';

export const PlatformFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  apiStatus: z.enum(EPlatformApiStatus).optional(),
});

export class PlatformFilterDto extends createZodDto(PlatformFilterSchema) {}
