import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { PlatformApiStatus } from '@/core/enums';

export const PlatformFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  apiStatus: z.enum(PlatformApiStatus).optional(),
});

export class PlatformFilterDto extends createZodDto(PlatformFilterSchema) {}
