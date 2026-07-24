import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { PlatformApiStatus } from '@/core/enums';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PlatformFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  apiStatus: z.enum(PlatformApiStatus).optional(),
});

export class PlatformFilterDto extends createZodDto(PlatformFilterSchema) {}
