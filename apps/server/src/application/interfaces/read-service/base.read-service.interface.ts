import { JsonRecord, Nullable } from "@/shared/types/utility.type";
import { CursorPaginationRequestDto, PaginatedResponseDto } from "@/shared/dtos/pagination.dto";

/**
 * Base Read Service Interface.
 * Used exclusively for Query Operations (CQRS).
 * It returns Data Transfer Objects (DTOs) directly, completely bypassing the Domain layer
 * (Entities and Aggregate Roots) to maximize read performance.
 */
export interface IBaseReadService<DTO, Filters extends CursorPaginationRequestDto = CursorPaginationRequestDto> {
  /**
   * Fetches a single read-optimized DTO by id.
   */
  findById(id: string): Promise<Nullable<DTO>>;

  /**
   * Fetches a paginated response of read-optimized DTOs based on filters and cursor.
   */
  findAll(filters?: Filters): Promise<PaginatedResponseDto<DTO>>;
}
