import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const CursorPaginationRequestSchema = z.object({
  cursor: z.string().optional().nullable(),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.enum(SortOrder).default(SortOrder.DESC),
});

export class CursorPaginationRequestDto extends createZodDto(CursorPaginationRequestSchema) {}

export class PaginatedResponseDto<T> {
  cursor: string | null;
  data: T[];

  constructor(data: T[], nextCursor: string | null = null) {
    this.data = data;
    this.cursor = nextCursor;
  }
}
