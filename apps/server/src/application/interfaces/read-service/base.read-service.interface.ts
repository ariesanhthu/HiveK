import { JsonRecord, Nullable } from "@/shared/types/utility.type";

/**
 * Base Read Service Interface.
 * Used exclusively for Query Operations (CQRS).
 * It returns Data Transfer Objects (DTOs) directly, completely bypassing the Domain layer
 * (Entities and Aggregate Roots) to maximize read performance.
 */
export interface IBaseReadService<DTO, Filters = JsonRecord> {
  /**
   * Fetches a single read-optimized DTO by id.
   */
  findById(id: string): Promise<Nullable<DTO>>;

  /**
   * Fetches an array of read-optimized DTOs based on optional filters.
   * Can be extended to support pagination in specific child interfaces.
   */
  findAll(filters?: Filters): Promise<DTO[]>;
}
