import type { JsonObject, JsonValue } from '@/core/types/common.type';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null; // Holds payload on success; null on error
  error: {
    code: string; // Machine-readable error identifier (e.g., "NOT_FOUND")
    message: string; // Human-readable generic error message
    details?: Array<{
      // Optional: Contextual errors (validation, boundaries)
      field?: string;
      message: string;
    }>;
  } | null;
  meta: CursorPaginationMeta | JsonObject | null;
}

export interface CursorPaginationMeta {
  cursor: string;
  has_next: boolean;
  limit: number;
  [key: string]: JsonValue;
}
