import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/shared/dtos/pagination.dto';
import { PlatformApiStatus } from '@/core/enums';

export const PlatformFilterSchema = CursorPaginationRequestSchema.extend({
  name: z.string().optional(),
  apiStatus: z.nativeEnum(PlatformApiStatus).optional(),
});

export class PlatformFilterDto extends createZodDto(PlatformFilterSchema) {}
