import { SortOrder } from './pagination.dto';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GrantDtoSchema, GrantDto } from './package.dto';

const RenewableUsageSchema = z.object({
  key: z.string(),
  allocated: z.number(),
  used: z.number(),
  cycleStartAt: z.date(),
  cycleEndsAt: z.date(),
});

export type RenewableUsageDTO = z.infer<typeof RenewableUsageSchema>;

export class QuotaUsageResponseDto {
  id: string;
  enterpriseId: string;
  cycleAnchorDate: Date;
  usages: RenewableUsageDTO[];
  updatedAt: Date;
}
export class QuotaUsageFilterDto {
  enterpriseId?: string;
  cursor?: string;
  limit?: number;
  sort?: SortOrder;
}
