import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UploadedFileFilterSchema = CursorPaginationRequestSchema.extend({
  targetId: z.string().optional(),
  format: z.string().optional(),
  size: z.coerce.number().optional(),
  minSize: z.coerce.number().optional(),
  maxSize: z.coerce.number().optional(),
});

export class UploadedFileFilterDto extends createZodDto(
  UploadedFileFilterSchema,
) {}
