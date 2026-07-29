import { SortOrder, CursorPaginationRequestSchema } from './pagination.dto';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RenewableUsageSchema = z
  .object({
    key: z.string(),
    allocated: z.number(),
    used: z.number(),
    cycleStartAt: z.iso.datetime(),
    cycleEndsAt: z.iso.datetime(),
  })
  .strict();

export class RenewableUsageDto extends createZodDto(RenewableUsageSchema) {}
export type RenewableUsageDTO = RenewableUsageDto;

export const QuotaUsageResponseDtoSchema = z
  .object({
    id: z.string(),
    enterpriseId: z.string(),
    cycleAnchorDate: z.iso.datetime(),
    usages: z.array(RenewableUsageSchema),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export class QuotaUsageResponseDto extends createZodDto(
  QuotaUsageResponseDtoSchema,
) {}

export const QuotaUsageFilterDtoSchema = CursorPaginationRequestSchema.extend({
  enterpriseId: z.string().optional(),
});

export class QuotaUsageFilterDto extends createZodDto(
  QuotaUsageFilterDtoSchema,
) {}
