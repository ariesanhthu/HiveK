import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CursorPaginationRequestSchema } from '@/application/dtos/pagination.dto';

export const UploadedFileFilterSchema = CursorPaginationRequestSchema.extend({
  targetId: z.string().optional(),
  format: z.string().optional(),
  size: z.coerce.number().optional(),
  minSize: z.coerce.number().optional(),
  maxSize: z.coerce.number().optional(),
});

export class UploadedFileFilterDto extends createZodDto(UploadedFileFilterSchema) {}
